# T1～T6 実装用マスタデータ（3事象）

**対象事象**: ドアが開かない（DOOR_NOT_OPEN）・警告灯が点灯した（WARNING_LAMP_ON）・Bluetoothが接続できない（BT_NOT_CONNECTED）

**CSVの文字コード**: **UTF-8（BOM付き）** で保存しています。

**Excelで文字化けする場合**（ファイルをダブルクリックで開くと文字化けするとき）は、次の手順で開いてください。
1. Excelで **[データ]** タブ → **[テキストまたはCSVから]** をクリック
2. 開きたい CSV ファイルを選択 → **[インポート]**
3. **[ファイルの元の形式]** で **「65001: Unicode (UTF-8)」** を選択
4. **[読み込み]** をクリック

これで日本語が正しく表示されます。

**Excel でダブルクリックして開きたい場合**（上記のインポート手順を使いたくない場合）は、**event_master.csv を Excel で閉じた状態で**、同フォルダで `py event_master_to_cp932.py` を実行してください。ファイルが Shift-JIS (CP932) で保存し直され、Excel でそのまま開いても文字化けしません。※ エディタで開くと UTF-8 前提では文字化けするため、編集後はこのスクリプトを再実行するか、UTF-8 のまま「データ → テキストまたはCSVから」で開いてください。

プログラムから読む場合は `encoding='utf-8-sig'`（Python）または `UTF-8` を指定してください。CP932 で保存した場合は `encoding='cp932'` を指定してください。

---

## ファイル一覧

| ファイル | 用途 | T段階 |
|:--|:--|:--|
| **event_master.csv** | 事象ID・ラベル・緊急度・心理リスク・subtype候補 | T1 |
| **event_rules.csv** | 条件→event_id のルール（UI選択・操作ログ等） | T1 |
| **keyword_to_event.csv** | キーワード／意図→event_id のマッピング | T1 |
| **cause_master.csv** | 原因ID・説明・risk_level・action_group・必要観察・車種条件 | T2 |
| **event_cause.csv** | event_id→cause_id の対応と優先度（事前確率のヒント） | T2 |
| **observation_cause_split.csv** | 質問（check_id）×回答値→支持/除外する原因（expected_split用） | T3・T4 |
| **cause_to_guide.csv** | 原因→推奨ガイド（行動）・immediate/permanent/escalation | T5 |
| **guide_action_type.csv** | ガイドの一時/恒久・次のステップ誘導（next_step_guide_id） | T6 |
| **t3_ban_rules.csv** | T3で質問を出さない条件（走行中・緊急度等） | T3 |
| **t6_thresholds.csv** | T6の試行回数・エスカレーションしきい値・確信度しきい値 | T6 |
| **observation_master_bt.csv** | Bluetooth用の質問定義（BT-C001～BT-C005） | T3 |

---

## 既存CSVとの対応

- **CheckCondition.csv**: 質問文言（question）・answer_type・answers は既存のまま利用。**observation_cause_split.csv** の check_id は CheckCondition の check_id と一致させる。
- **Bluetooth（THEME-BT）**: 質問 check_id は **BT-C001～BT-C005**。質問文言は **observation_master_bt.csv** を参照。CheckCondition.csv に同じ check_id で追加してもよい。
- **Guide.csv**: ドア・警告灯は既存 GUIDE-001～GUIDE-013、GUIDE-BRAKE-SAFETY 等を参照。Bluetooth 用は **GUIDE-BT-001～GUIDE-BT-003** を仮IDとして記載。実際のガイドコンテンツは別途作成すること。

---

## 使い方（エンジン側）

1. **T1**: event_rules で条件マッチ、keyword_to_event で自由文マッチ。event_master で urgency・psychological_risk を取得。
2. **T2**: event_cause で event_id に紐づく cause_id を取得。cause_master で車種フィルタ・メタ情報付与。
3. **T3**: cause_candidates と observation_cause_split から「情報利得」が大きい質問を選択。t3_ban_rules で文脈に応じた除外。
4. **T4**: ユーザー回答と observation_cause_split の cause_ids_supported / cause_ids_excluded で条件一致度を算出し、確率更新。
5. **T5**: cause_to_guide で上位原因に紐づく guide_id を取得。guide_action_type で一時/恒久・次のステップを付与。
6. **T6**: guide_action_type の is_temporary_solution・next_step_guide_id を参照。t6_thresholds で試行回数・エスカレーション判定。

---

## 更新・拡張

- 新規事象を追加する場合: event_master / event_rules / keyword_to_event に追加し、cause_master / event_cause / observation_cause_split / cause_to_guide を整備する。
- 新規質問を追加する場合: CheckCondition.csv に追加し、observation_cause_split.csv に check_id と answer_value ごとの cause_ids_supported を追加する。
