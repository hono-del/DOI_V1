# -*- coding: utf-8 -*-
"""t1t6_master 内のCSVを UTF-8 から Shift-JIS (CP932) に変換する。Excelで文字化けしないようにする。"""
import os

DIR = os.path.dirname(os.path.abspath(__file__))
CSV_NAMES = [
    "event_master.csv",
    "event_rules.csv",
    "keyword_to_event.csv",
    "cause_master.csv",
    "event_cause.csv",
    "observation_cause_split.csv",
    "cause_to_guide.csv",
    "guide_action_type.csv",
    "t3_ban_rules.csv",
    "t6_thresholds.csv",
    "observation_master_bt.csv",
]

for name in CSV_NAMES:
    path = os.path.join(DIR, name)
    if not os.path.exists(path):
        print("skip (not found):", name)
        continue
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        # BOM があれば除去（UTF-8 として読んだ後は文字として残っている場合がある）
        if content.startswith("\ufeff"):
            content = content[1:]
        with open(path, "w", encoding="cp932") as f:
            f.write(content)
        print("ok:", name)
    except Exception as e:
        print("error:", name, e)
