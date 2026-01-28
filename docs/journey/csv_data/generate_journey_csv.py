#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Journey Graph CSV Generator
超シンプル形式(形式1: 記号ベース)からJourney Graph CSVを自動生成

使い方:
    py generate_journey_csv.py THEME-002_input.txt
"""

import sys
import os
import re
import csv
from typing import List, Dict, Tuple, Optional
from datetime import datetime


class FlowParser:
    """フロー定義ファイルをパースしてCSVデータを生成"""
    
    def __init__(self, input_file: str):
        self.input_file = input_file
        self.theme_id = ""
        self.theme_name = ""
        self.urgency = "medium"
        self.intents = []
        
        self.nodes = []
        self.checks = []
        self.edges = []
        self.guides = []
        self.node_intents = []
        
        self.node_counter = 1
        self.check_counter = 1
        self.edge_counter = 1
        self.current_node_id = None
        
    def parse(self) -> bool:
        """ファイルを読み込んでパース"""
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # メタデータの抽出
            self._parse_metadata(lines)
            
            # フロー定義のパース
            self._parse_flow(lines)
            
            return True
        except Exception as e:
            print(f"エラー: {e}")
            return False
    
    def _parse_metadata(self, lines: List[str]):
        """メタデータ(テーマ名、ID等)を抽出"""
        for line in lines:
            line = line.strip()
            
            # テーマ名
            if line.startswith('テーマ:'):
                self.theme_name = line.replace('テーマ:', '').strip()
            
            # テーマID
            elif line.startswith('ID:'):
                self.theme_id = line.replace('ID:', '').strip()
            
            # 緊急度
            elif line.startswith('緊急度:'):
                self.urgency = line.replace('緊急度:', '').strip()
            
            # インテント
            elif line.startswith('インテント:'):
                intents_str = line.replace('インテント:', '').strip()
                self.intents = [i.strip() for i in intents_str.split(',')]
    
    def _parse_flow(self, lines: List[str]):
        """フロー定義をパース"""
        i = 0
        while i < len(lines):
            line = lines[i].rstrip()
            
            # 空行はスキップ
            if not line.strip():
                i += 1
                continue
            
            # メタデータセクションはスキップ
            if any(line.strip().startswith(prefix) for prefix in ['テーマ:', 'ID:', '緊急度:', 'インテント:', '---', '```']):
                i += 1
                continue
            
            # 開始ノード: ▼
            if '▼' in line:
                i = self._parse_start_node(lines, i)
            
            # 通常ノード: ■
            elif '■' in line:
                i = self._parse_node(lines, i)
            
            # 判定ノード: ?
            elif '?' in line and not line.strip().startswith('→'):
                i = self._parse_check(lines, i)
            
            # 終端ノード: ✓ ✗ ⚠
            elif any(symbol in line for symbol in ['✓', '✗', '⚠']):
                i = self._parse_terminal_node(lines, i)
            
            else:
                i += 1
        
        # インテントの自動推定
        self._auto_assign_intents()
    
    def _parse_start_node(self, lines: List[str], start_idx: int) -> int:
        """開始ノードをパース"""
        line = lines[start_idx].strip()
        node_name = line.replace('▼', '').strip()
        
        node_id = f"{self.theme_id}-START"
        
        self.nodes.append({
            'node_id': node_id,
            'theme_id': self.theme_id,
            'phase': '異常検知',
            'state_description': node_name,
            'trigger': 'ユーザーが問題を認識',
            'hypotheses': '',
            'confidence_level': 1.0,
            'notes': '開始ノード'
        })
        
        self.current_node_id = node_id
        
        return start_idx + 1
    
    def _parse_node(self, lines: List[str], start_idx: int) -> int:
        """通常ノードをパース"""
        line = lines[start_idx].strip()
        node_name = line.replace('■', '').strip()
        
        node_id = f"{self.theme_id}-N{self.node_counter:03d}"
        self.node_counter += 1
        
        # 次の行を確認してフェーズを判定
        phase = self._infer_phase(node_name)
        
        # ガイドの確認
        guide_id = None
        i = start_idx + 1
        while i < len(lines) and lines[i].startswith(' '):
            if '[GUIDE]' in lines[i]:
                guide_name = lines[i].split('[GUIDE]')[1].strip()
                guide_id = self._create_guide(node_id, guide_name)
            i += 1
        
        self.nodes.append({
            'node_id': node_id,
            'theme_id': self.theme_id,
            'phase': phase,
            'state_description': node_name,
            'trigger': '',
            'hypotheses': '',
            'confidence_level': 0.8,
            'notes': ''
        })
        
        self.current_node_id = node_id
        
        return start_idx + 1
    
    def _parse_check(self, lines: List[str], start_idx: int) -> int:
        """判定ノード(質問)をパース"""
        line = lines[start_idx].strip()
        question = line.replace('?', '').strip()
        
        check_id = f"{self.theme_id}-C{self.check_counter:03d}"
        self.check_counter += 1
        
        # 選択肢を収集
        answers = []
        next_nodes = []
        i = start_idx + 1
        
        while i < len(lines) and lines[i].startswith(' ') and '→' in lines[i]:
            choice_line = lines[i].strip()
            if choice_line.startswith('→'):
                # "→ はい: 次のノード" の形式
                parts = choice_line.replace('→', '').split(':')
                if len(parts) >= 2:
                    answer = parts[0].strip()
                    next_node_name = parts[1].strip()
                    answers.append(answer)
                    next_nodes.append((answer, next_node_name))
            i += 1
        
        # CheckCondition追加
        self.checks.append({
            'check_id': check_id,
            'node_id': self.current_node_id,
            'question': question,
            'answer_type': 'boolean' if len(answers) == 2 else 'choice',
            'answers': '|'.join(answers),
            'supports': '',
            'notes': ''
        })
        
        # エッジを作成
        for answer, next_node_name in next_nodes:
            # 次のノードIDを解決(簡易版: ノード名から推測)
            next_node_id = self._resolve_node_id(next_node_name)
            
            edge_id = f"{self.theme_id}-E{self.edge_counter:03d}"
            self.edge_counter += 1
            
            self.edges.append({
                'edge_id': edge_id,
                'from_node_id': self.current_node_id,
                'condition': check_id,
                'condition_value': answer,
                'to_type': 'node',
                'to_id': next_node_id,
                'priority': len(self.edges) + 1
            })
        
        return i
    
    def _parse_terminal_node(self, lines: List[str], start_idx: int) -> int:
        """終端ノード(解決/問題/エスカレーション)をパース"""
        line = lines[start_idx].strip()
        
        if '✓' in line:
            symbol = '✓'
            phase = '対応完了'
        elif '✗' in line:
            symbol = '✗'
            phase = '問題・故障'
        elif '⚠' in line:
            symbol = '⚠'
            phase = 'エスカレーション'
        else:
            return start_idx + 1
        
        node_name = line.replace(symbol, '').strip()
        node_id = f"{self.theme_id}-{node_name.replace(' ', '-')}"
        
        # ガイドの確認
        i = start_idx + 1
        while i < len(lines) and lines[i].startswith(' '):
            if '[GUIDE]' in lines[i]:
                guide_name = lines[i].split('[GUIDE]')[1].strip()
                self._create_guide(node_id, guide_name)
            i += 1
        
        self.nodes.append({
            'node_id': node_id,
            'theme_id': self.theme_id,
            'phase': phase,
            'state_description': node_name,
            'trigger': '',
            'hypotheses': '',
            'confidence_level': 1.0,
            'notes': f'終端ノード({symbol})'
        })
        
        self.current_node_id = node_id
        
        return start_idx + 1
    
    def _create_guide(self, node_id: str, guide_name: str) -> str:
        """ガイドを作成"""
        guide_id = f"GUIDE-{len(self.guides) + 1:03d}"
        
        # 既存チェック
        for guide in self.guides:
            if guide['title'] == guide_name:
                return guide['guide_id']
        
        self.guides.append({
            'guide_id': guide_id,
            'guide_type': 'procedure',
            'title': guide_name,
            'estimated_time': '5min',
            'risk_level': 'low',
            'notes': ''
        })
        
        return guide_id
    
    def _resolve_node_id(self, node_name: str) -> str:
        """ノード名からノードIDを推測(簡易版)"""
        # 既存ノードから検索
        for node in self.nodes:
            if node_name in node['state_description']:
                return node['node_id']
        
        # 新規ノード(後で追加される予定)
        # とりあえずプレースホルダーを返す
        return f"{self.theme_id}-{node_name[:10].replace(' ', '-')}"
    
    def _infer_phase(self, node_name: str) -> str:
        """ノード名からフェーズを推測"""
        if any(word in node_name for word in ['疑い', '可能性', '診断']):
            return '原因仮説'
        elif any(word in node_name for word in ['対応', '実施', '使用', '交換']):
            return '対応選択'
        elif any(word in node_name for word in ['解決', '成功', '完了']):
            return '対応完了'
        elif any(word in node_name for word in ['故障', '失敗', '問題']):
            return '問題・故障'
        elif any(word in node_name for word in ['サービス', 'エスカレーション']):
            return 'エスカレーション'
        else:
            return '判定'
    
    def _auto_assign_intents(self):
        """ノードに自動的にインテントを割り当て"""
        for node in self.nodes:
            primary_intent = 'I1'  # デフォルト: 問題解決サポート
            secondary_intent = ''
            
            phase = node['phase']
            
            if phase == '異常検知':
                primary_intent = 'I1'
                secondary_intent = 'I4'
            elif phase == '原因仮説':
                primary_intent = 'I1'
                secondary_intent = 'I3'
            elif phase == '対応選択':
                primary_intent = 'I2'
                secondary_intent = 'I1'
            elif phase == '対応完了':
                primary_intent = 'I3'
                secondary_intent = ''
            elif phase == 'エスカレーション':
                primary_intent = 'I5'
                secondary_intent = ''
            
            self.node_intents.append({
                'node_id': node['node_id'],
                'primary_intent': primary_intent,
                'secondary_intent': secondary_intent,
                'confidence': 0.8,
                'notes': f'自動推定({phase})'
            })
    
    def save_to_csv(self, output_dir: str):
        """CSVファイルに出力"""
        os.makedirs(output_dir, exist_ok=True)
        
        # UTF-8 BOMで書き込み
        encoding = 'utf-8-sig'
        
        # JourneyNode.csv
        self._append_to_csv(
            os.path.join(output_dir, 'JourneyNode.csv'),
            ['node_id', 'theme_id', 'phase', 'state_description', 'trigger', 'hypotheses', 'confidence_level', 'notes'],
            self.nodes,
            encoding
        )
        
        # CheckCondition.csv
        self._append_to_csv(
            os.path.join(output_dir, 'CheckCondition.csv'),
            ['check_id', 'node_id', 'question', 'answer_type', 'answers', 'supports', 'notes'],
            self.checks,
            encoding
        )
        
        # Edge.csv
        self._append_to_csv(
            os.path.join(output_dir, 'Edge.csv'),
            ['edge_id', 'from_node_id', 'condition', 'condition_value', 'to_type', 'to_id', 'priority'],
            self.edges,
            encoding
        )
        
        # Guide.csv
        self._append_to_csv(
            os.path.join(output_dir, 'Guide.csv'),
            ['guide_id', 'guide_type', 'title', 'estimated_time', 'risk_level', 'notes'],
            self.guides,
            encoding
        )
        
        # NodeIntent.csv
        self._append_to_csv(
            os.path.join(output_dir, 'NodeIntent.csv'),
            ['node_id', 'primary_intent', 'secondary_intent', 'confidence', 'notes'],
            self.node_intents,
            encoding
        )
    
    def _append_to_csv(self, filepath: str, headers: List[str], data: List[Dict], encoding: str):
        """CSVファイルに追記"""
        file_exists = os.path.exists(filepath)
        
        with open(filepath, 'a', newline='', encoding=encoding) as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            
            # ヘッダーは新規ファイルの場合のみ
            if not file_exists:
                writer.writeheader()
            
            writer.writerows(data)
        
        print(f"  追加: {filepath} ({len(data)}行)")
    
    def generate_flow_html(self, output_file: str):
        """フロー図HTML生成"""
        # Mermaid図を生成
        mermaid_code = self._generate_mermaid()
        
        html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.theme_name} - フロー図</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {{
            font-family: 'Segoe UI', Meiryo, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }}
        h1 {{
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .mermaid {{
            background-color: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
    </style>
</head>
<body>
    <h1>{self.theme_name} - フロー図</h1>
    <p><strong>テーマID:</strong> {self.theme_id}</p>
    <p><strong>緊急度:</strong> {self.urgency}</p>
    <p><strong>生成日時:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    
    <div class="mermaid">
{mermaid_code}
    </div>

    <script>
        mermaid.initialize({{ 
            startOnLoad: true,
            theme: 'default',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }}
        }});
    </script>
</body>
</html>
"""
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"  生成: {output_file}")
    
    def _generate_mermaid(self) -> str:
        """Mermaid図のコード生成"""
        lines = ["graph TD"]
        
        # ノードの定義
        for node in self.nodes:
            node_id = node['node_id'].replace('-', '_')
            label = node['state_description'][:30]  # 長すぎる場合は切る
            
            if node['phase'] == '異常検知':
                lines.append(f"    {node_id}([{label}])")
            elif node['phase'] == '対応完了':
                lines.append(f"    {node_id}[/{label}/]")
            elif node['phase'] in ['問題・故障', 'エスカレーション']:
                lines.append(f"    {node_id}[{label}]")
            else:
                lines.append(f"    {node_id}[{label}]")
        
        # エッジの定義
        for edge in self.edges:
            from_id = edge['from_node_id'].replace('-', '_')
            to_id = edge['to_id'].replace('-', '_')
            label = edge.get('condition_value', '')
            
            if label:
                lines.append(f"    {from_id} -->|{label}| {to_id}")
            else:
                lines.append(f"    {from_id} --> {to_id}")
        
        return '\n'.join(lines)


def main():
    if len(sys.argv) < 2:
        print("使い方: py generate_journey_csv.py <入力ファイル>")
        print("例: py generate_journey_csv.py THEME-002_input.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if not os.path.exists(input_file):
        print(f"エラー: ファイルが見つかりません: {input_file}")
        sys.exit(1)
    
    print(f"\n=== Journey Graph CSV Generator ===\n")
    print(f"入力ファイル: {input_file}\n")
    
    # パース
    parser = FlowParser(input_file)
    if not parser.parse():
        print("エラー: パースに失敗しました")
        sys.exit(1)
    
    print(f"テーマ: {parser.theme_name} ({parser.theme_id})")
    print(f"ノード数: {len(parser.nodes)}")
    print(f"判定数: {len(parser.checks)}")
    print(f"エッジ数: {len(parser.edges)}")
    print(f"ガイド数: {len(parser.guides)}\n")
    
    # CSV出力
    output_dir = os.path.dirname(os.path.abspath(__file__))
    print("CSVに追記中...")
    parser.save_to_csv(output_dir)
    
    # フロー図生成
    print("\nフロー図生成中...")
    theme_id = parser.theme_id
    html_file = os.path.join(output_dir, f"{theme_id}_visual_flow.html")
    parser.generate_flow_html(html_file)
    
    print(f"\n=== 完了 ===")
    print(f"\n次のステップ:")
    print(f"1. CSVファイルを確認")
    print(f"2. {theme_id}_visual_flow.html をブラウザで開く")
    print(f"3. 必要に応じてCSVを手動調整")
    print(f"4. py journey_processor.py でテスト実行")


if __name__ == '__main__':
    main()
