# -*- coding: utf-8 -*-
"""
Guide.csvにJSONファイルパスを追加するスクリプト

注意: 現在のGuide.csvは既にGUIDE-001〜GUIDE-013の13ガイドで更新済みです。
このスクリプトは検証用にGuide_updated.csvを出力します。

Usage:
    py update_guide_csv_with_json.py
"""

import csv
import json
from pathlib import Path

# ファイルパス
GUIDE_CSV = Path(__file__).parent / "Guide.csv"
GUIDE_CONTENT_DIR = Path(__file__).parent / "guide_content"
OUTPUT_CSV = Path(__file__).parent / "Guide_updated.csv"  # 検証用出力

def load_existing_guides():
    """既存のGuide.csvを読み込む"""
    guides = []
    
    with open(GUIDE_CSV, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            guides.append(row)
    
    return guides

def check_json_exists(guide_id):
    """対応するJSONファイルが存在するか確認"""
    json_file = GUIDE_CONTENT_DIR / f"{guide_id}_content.json"
    return json_file.exists()

def get_json_info(guide_id):
    """JSONファイルから情報を取得"""
    json_file = GUIDE_CONTENT_DIR / f"{guide_id}_content.json"
    
    if not json_file.exists():
        return None
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return {
        'json_path': f"guide_content/{guide_id}_content.json",
        'type': data.get('type', ''),
        'estimated_time': data.get('estimated_time', ''),
        'difficulty': data.get('difficulty', ''),
        'source_type': data.get('source', {}).get('type', 'xml_based')
    }

def main():
    """メイン処理"""
    print("=" * 60)
    print("Guide.csv Update with JSON")
    print("=" * 60)
    
    # 既存ガイドを読み込み
    guides = load_existing_guides()
    print(f"\n[LOAD] {len(guides)} guides loaded from Guide.csv")
    
    # JSONファイルとマッチング
    matched = 0
    updated_guides = []
    
    for guide in guides:
        guide_id = guide.get('guide_id', '')
        
        json_info = get_json_info(guide_id)
        
        if json_info:
            # JSONファイルが存在する場合、情報を追加
            guide['json_path'] = json_info['json_path']
            guide['guide_type'] = json_info['type']
            guide['difficulty'] = json_info['difficulty']
            guide['source_type'] = json_info['source_type']
            
            print(f"[MATCH] {guide_id}: {guide.get('guide_title', '')}")
            matched += 1
        else:
            # JSONファイルが存在しない場合、空欄
            guide['json_path'] = ''
            guide['guide_type'] = guide.get('guide_type', '')
            guide['difficulty'] = ''
            guide['source_type'] = ''
            
            print(f"[NO_JSON] {guide_id}: {guide.get('guide_title', '')}")
        
        updated_guides.append(guide)
    
    # 拡張CSVを出力
    if updated_guides:
        fieldnames = list(updated_guides[0].keys())
        
        with open(OUTPUT_CSV, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(updated_guides)
        
        print(f"\n[SAVE] Updated CSV: {OUTPUT_CSV.name}")
    
    # サマリー
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total guides: {len(guides)}")
    print(f"Matched with JSON: {matched}")
    print(f"Match rate: {matched/len(guides)*100:.1f}%")
    print(f"\n[INFO] Guide_updated.csv created (検証用)")
    print("[INFO] 注意: 現在のGuide.csvは既にGUIDE-001〜GUIDE-013で更新済みです")
    print("\nComplete!")

if __name__ == "__main__":
    main()
