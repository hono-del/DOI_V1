# -*- coding: utf-8 -*-
"""
XML取扱説明書からガイドコンテンツを抽出するスクリプト

Usage:
    py extract_xml_guide_content.py
"""

import xml.etree.ElementTree as ET
import os
import json
from pathlib import Path

# XMLファイルのディレクトリ
XML_DIR = Path(__file__).parent.parent.parent / "xml_aqua"
OUTPUT_DIR = Path(__file__).parent / "guide_content"

# 出力ディレクトリ作成
OUTPUT_DIR.mkdir(exist_ok=True)

def parse_xml_file(xml_path):
    """XMLファイルをパースして構造を取得"""
    try:
        # DTDエンティティを無視してパース
        parser = ET.XMLParser()
        parser.entity = {}  # エンティティ辞書を空にする
        parser.parser.UseForeignDTD(True)  # 外部DTDを使用
        parser.parser.SetParamEntityParsing(ET.expat.XML_PARAM_ENTITY_PARSING_NEVER)
        
        tree = ET.parse(xml_path, parser=parser)
        root = tree.getroot()
        return root
    except ET.ParseError as e:
        print(f"[ERROR] Parse error: {xml_path.name} - {e}")
        return None
    except Exception as e:
        print(f"[ERROR] Error: {xml_path.name} - {e}")
        return None

def extract_chapter_info(root):
    """チャプター情報を抽出"""
    chapters = []
    
    # 名前空間の処理が必要な場合があるため、findallで直接検索
    for chapter in root.findall(".//{http://toyota.com/}chapter") + root.findall(".//chapter"):
        chapter_id = chapter.get('id', 'unknown')
        chapter_num = chapter.get('chapnum', 'unknown')
        
        # タイトルを取得
        title_elem = chapter.find('.//{http://toyota.com/}title') or chapter.find('.//title')
        title = title_elem.text if title_elem is not None and title_elem.text else "タイトル不明"
        
        chapters.append({
            'id': chapter_id,
            'chapnum': chapter_num,
            'title': title
        })
    
    return chapters

def search_keyword_in_xml(root, keywords):
    """XMLから特定キーワードを含む要素を検索"""
    results = []
    
    # すべてのテキスト要素を検索
    for elem in root.iter():
        if elem.text:
            for keyword in keywords:
                if keyword in elem.text:
                    # 親要素のIDやパスを取得
                    parent_info = {
                        'tag': elem.tag,
                        'text': elem.text.strip()[:200],  # 最大200文字
                        'keyword': keyword
                    }
                    
                    # 親要素のIDを探す
                    parent = elem
                    while parent is not None:
                        if 'id' in parent.attrib:
                            parent_info['section_id'] = parent.attrib['id']
                            break
                        parent = parent.find('..')
                    
                    results.append(parent_info)
                    break  # 1つのキーワードが見つかったら次の要素へ
    
    return results

def extract_guide_content(xml_path, guide_info):
    """特定ガイドのコンテンツをXMLから抽出"""
    print(f"\n[FILE] {xml_path.name}")
    print(f"  Guide: {guide_info['title']}")
    print(f"  Keywords: {', '.join(guide_info['keywords'])}")
    
    root = parse_xml_file(xml_path)
    if root is None:
        return None
    
    # キーワード検索
    results = search_keyword_in_xml(root, guide_info['keywords'])
    
    if results:
        print(f"  [OK] {len(results)} matches found")
        return {
            'guide_id': guide_info['guide_id'],
            'title': guide_info['title'],
            'source_xml': xml_path.name,
            'matches': results[:10]  # 最大10件
        }
    else:
        print(f"  [WARN] No match")
        return None

# ガイド定義
GUIDE_DEFINITIONS = [
    {
        'guide_id': 'GUIDE-001',
        'title': '機械キーの取り出し方',
        'xml_files': ['M52P95tojpjavhch03.xml', 'M52P95tojpjavhch01.xml'],
        'keywords': ['機械キー', 'メカニカルキー', '内蔵キー', 'キー　取り出し']
    },
    {
        'guide_id': 'GUIDE-002',
        'title': '機械キーの場所・保管方法',
        'xml_files': ['M52P95tojpjavhch03.xml'],
        'keywords': ['機械キー', '保管', '格納']
    },
    {
        'guide_id': 'GUIDE-003',
        'title': '事前準備物',
        'xml_files': ['M52P95tojpjavhch03.xml', 'M52P95tojpjavhch06.xml'],
        'keywords': ['マイナスドライバー', 'CR2450', '事前に準備', '準備するもの']
    },
    {
        'guide_id': 'GUIDE-005',
        'title': '電池交換手順',
        'xml_files': ['M52P95tojpjavhch03.xml', 'M52P95tojpjavhch06.xml'],
        'keywords': ['電池交換', '電池　交換', 'リチウム電池', '部品が破損']
    },
    {
        'guide_id': 'GUIDE-007',
        'title': 'ジャンプスタート手順',
        'xml_files': ['M52P95tojpjavhch07.xml'],
        'keywords': ['ジャンプスタート', 'ジャンプ', 'バッテリー上がり', 'バッテリーあがり']
    },
    {
        'guide_id': 'GUIDE-008',
        'title': '電波干渉時の対応',
        'xml_files': ['M52P95tojpjavhch03.xml', 'M52P95tojpjavhch07.xml'],
        'keywords': ['電波干渉', '強い電波', '空港', '放送局', 'キーを車体に近づける']
    },
    {
        'guide_id': 'GUIDE-010',
        'title': 'ドアロック故障時の対応',
        'xml_files': ['M52P95tojpjavhch07.xml'],
        'keywords': ['ドアロック　故障', 'ドア　開かない', '解錠できない']
    },
    {
        'guide_id': 'GUIDE-011',
        'title': 'ロードサービス連絡先',
        'xml_files': ['M52P95tojpjavhch07.xml'],
        'keywords': ['ロードサービス', '緊急時', 'JAF', '連絡先']
    },
    {
        'guide_id': 'GUIDE-013',
        'title': '予防策・定期点検',
        'xml_files': ['M52P95tojpjavhch06.xml'],
        'keywords': ['定期点検', '日常点検', '予防', 'メンテナンス']
    },
]

def main():
    """メイン処理"""
    print("=" * 60)
    print("XML Guide Content Extraction")
    print("=" * 60)
    
    # XML_DIRの確認
    if not XML_DIR.exists():
        print(f"[ERROR] XML directory not found: {XML_DIR}")
        return
    
    print(f"\n[DIR] XML: {XML_DIR}")
    print(f"[DIR] Output: {OUTPUT_DIR}")
    
    # まず全XMLファイルのチャプター情報を表示
    print("\n" + "=" * 60)
    print("XML Files")
    print("=" * 60)
    
    xml_files = sorted(XML_DIR.glob("M52P95tojpjavhch*.xml"))
    
    for xml_file in xml_files:
        root = parse_xml_file(xml_file)
        if root:
            chapters = extract_chapter_info(root)
            if chapters:
                for ch in chapters:
                    print(f"{xml_file.name:30} | ch{ch['chapnum']:>2} | {ch['title']}")
    
    # 各ガイドの情報を抽出
    print("\n" + "=" * 60)
    print("Extracting Guide Content")
    print("=" * 60)
    
    all_results = []
    
    for guide_def in GUIDE_DEFINITIONS:
        guide_results = []
        
        for xml_filename in guide_def['xml_files']:
            xml_path = XML_DIR / xml_filename
            
            if xml_path.exists():
                result = extract_guide_content(xml_path, guide_def)
                if result:
                    guide_results.append(result)
        
        if guide_results:
            # ガイドごとのJSON出力
            output_file = OUTPUT_DIR / f"{guide_def['guide_id']}_content.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'guide_id': guide_def['guide_id'],
                    'title': guide_def['title'],
                    'sources': guide_results
                }, f, ensure_ascii=False, indent=2)
            
            print(f"  [SAVE] {output_file.name}")
            all_results.append(guide_def['guide_id'])
    
    # サマリー出力
    print("\n" + "=" * 60)
    print("Extraction Summary")
    print("=" * 60)
    print(f"[OK] Extracted: {len(all_results)} / {len(GUIDE_DEFINITIONS)} guides")
    print(f"[DIR] Output: {OUTPUT_DIR}")
    
    # マッピングサマリーファイル作成
    summary_file = OUTPUT_DIR / "extraction_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total_guides': len(GUIDE_DEFINITIONS),
            'extracted_guides': len(all_results),
            'success_rate': f"{len(all_results)/len(GUIDE_DEFINITIONS)*100:.1f}%",
            'extracted_guide_ids': all_results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"[FILE] Summary: {summary_file.name}")
    print("\nComplete!")

if __name__ == "__main__":
    main()
