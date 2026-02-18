# -*- coding: utf-8 -*-
"""event_master.csv を Shift-JIS (CP932) で保存し直す。Excel でダブルクリックして開いたときに文字化けしないようにする。
実行前に Excel で event_master.csv を閉じてください。"""
import os

DIR = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(DIR, "event_master.csv")

CONTENT = """event_id,theme_id,label_ja,default_urgency,default_psychological_risk,subtype_candidates,notes
DOOR_NOT_OPEN,THEME-001,ドアが開かない,0.7,medium,,スマートキーでドアが開かない
WARNING_LAMP_ON,THEME-002,警告灯が点灯した,0.8,high,"BRAKE|ENGINE|TPMS|CHARGE",ランプ/エンジン/タイヤ/充電灯
BT_NOT_CONNECTED,THEME-BT,Bluetoothが接続できない,0.4,low,"PHONE_SIDE|VEHICLE_SIDE|PAIRING|ENVIRONMENT",音声・音楽・車両・環境
"""

if __name__ == "__main__":
    try:
        with open(PATH, "w", encoding="cp932") as f:
            f.write(CONTENT)
        print("OK: event_master.csv を Shift-JIS (CP932) で保存しました。Excel でそのまま開けます。")
    except PermissionError:
        print("エラー: ファイルが開かれています。Excel で event_master.csv を閉じてから再度実行してください。")
    except Exception as e:
        print("エラー:", e)
