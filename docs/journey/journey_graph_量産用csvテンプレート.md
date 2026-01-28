以下は、取説DX / 体験OS における **Journey Graph を量産するためのCSVテンプレート** です。

このCSVは、
- 人が入力しやすい
- AI（RAG / Guide層）が解釈しやすい
- 後からUXログと接続しやすい

ことを前提に設計しています。

---

## ① テーマ定義シート（Theme.csv）

```csv
theme_id,theme_name,description,urgency_level,primary_intents,notes
THEME-001,ドアが開かない,スマートキーやドア操作で解錠できない状態,high,"I1|I3|I4",緊急対応と根本対応の分岐が重要
THEME-002,ブレーキ警告灯が点灯,ブレーキ関連の警告灯が点灯している状態,high,"I4|I5",走行可否判断が重要
THEME-003,タイヤ空気圧警告灯が点灯,空気圧警告灯が点灯している状態,medium,"I1|I3",継続走行判断がポイント
THEME-004,エンジンがかからない,始動操作をしてもエンジンが始動しない状態,high,"I1|I3|I5",仮説分岐が多い
THEME-005,先進機能が動かない,ICSやACCなどの先進機能が作動しない状態,low,"I2|I4",条件未達説明が中心
```

---

## ② ジャーニーノード定義シート（JourneyNode.csv）

```csv
node_id,theme_id,phase,state_description,trigger,hypotheses,confidence_level,notes
NODE-001,THEME-001,異常検知,スマートキーでドアが開かない,ドアに触れた,"スマートキー電池切れ|車両バッテリー上がり|電波干渉",0.9,初期ノード
NODE-002,THEME-002,異常検知,ブレーキ警告灯が点灯している,走行中,"パーキングブレーキ作動|ブレーキ液不足|システム異常",0.9,
NODE-003,THEME-003,異常検知,タイヤ空気圧警告灯が点灯している,走行中,"空気圧低下|急激な空気漏れ|センサー異常",0.9,
NODE-004,THEME-004,異常検知,スタートボタンを押してもエンジンがかからない,始動操作,"キー認識不良|バッテリー上がり|操作手順誤り",0.9,
NODE-005,THEME-005,異常検知,先進機能が作動しない,機能使用時,"作動条件未達|一時停止状態|センサー汚れ",0.9,
```

---

## ③ 判定条件定義シート（CheckCondition.csv）

```csv
check_id,node_id,question,answer_type,answers,supports,notes
CHECK-001,NODE-001,メーター内のインジケーターは点灯しますか？,boolean,"yes|no","車両バッテリー上がり|スマートキー電池切れ",
CHECK-002,NODE-002,パーキングブレーキは解除されていますか？,boolean,"yes|no","ブレーキ液不足|パーキングブレーキ作動",
CHECK-003,NODE-003,タイヤが明らかに潰れて見えますか？,boolean,"yes|no","急激な空気漏れ|空気圧低下",
CHECK-004,NODE-004,メーターは点灯しますか？,boolean,"yes|no","キー認識不良|バッテリー上がり",
CHECK-005,NODE-005,天候は悪いですか？,boolean,"yes|no","センサー汚れ|作動条件未達",
```

---

## ④ 分岐（エッジ）定義シート（Edge.csv）

```csv
edge_id,from_node_id,condition,condition_value,to_type,to_id,priority
EDGE-001,NODE-001,CHECK-001,yes,node,NODE-BATTERY-ISSUE,1
EDGE-002,NODE-001,CHECK-001,no,node,NODE-KEY-BATTERY,1
EDGE-003,NODE-002,CHECK-002,no,guide,GUIDE-BRAKE-SAFETY,1
EDGE-004,NODE-003,CHECK-003,yes,guide,GUIDE-TIRE-EMERGENCY,1
EDGE-005,NODE-004,CHECK-004,no,node,NODE-BATTERY-ISSUE,1
EDGE-006,NODE-005,CHECK-005,yes,guide,GUIDE-SENSOR-CLEANING,1
```

---

## ⑤ ガイド接続定義シート（Guide.csv）

```csv
guide_id,guide_type,title,estimated_time,risk_level,notes
GUIDE-KEY-BATTERY,procedure,スマートキー電池交換方法,10min,low,
GUIDE-BATTERY-ISSUE,procedure,バッテリー上がり時の対応,15min,medium,
GUIDE-BRAKE-SAFETY,alert,走行を控い販売店に連絡してください,immediate,high,
GUIDE-TIRE-EMERGENCY,procedure,スペアタイヤまたは修理キットの使用,20min,high,
GUIDE-SENSOR-CLEANING,procedure,センサー清掃方法,5min,low,
```

---

## ⑥ このCSVでできること

- テーマ横断でJourney構造を比較できる
- Node単位でUXログ（離脱・迷い）を紐づけ可能
- RAG検索キーとして `theme_id + node_id + intent` が使える

---

次のステップでは、

- **各テーマごとに3〜5ノードを実データで埋める**
- **Intent判定ロジックをCSVに追加する**
- **このCSVをそのままPoC入力データに使う**

まで一気に進められます。

👉 次は Step2（5テーマ×最低3ノードの実データ化）に進みますか？


---

# Step2：5テーマ × 最低3ノードの実データ化（サンプル）

以下は **そのままコピーして使える実データ例** です。まずはこの粒度で埋めることで、Journey Graph が実際に「辿れる」状態になります。

---

## ②-1 ジャーニーノード定義（追補：3ノード／テーマ）

```csv
node_id,theme_id,phase,state_description,trigger,hypotheses,confidence_level,notes
# THEME-001 ドアが開かない
NODE-001A,THEME-001,異常検知,スマートキーでドアが開かない,ドアに触れた,"スマートキー電池切れ|車両バッテリー上がり|電波干渉",0.9,初期ノード
NODE-001B,THEME-001,原因仮説,インジケーターが点灯しない,解錠操作,"スマートキー電池切れ|電波干渉",0.8,
NODE-001C,THEME-001,対応選択,すぐに開けたい,時間的制約,"機械キー使用|ロードサービス",0.7,意図分岐

# THEME-002 ブレーキ警告灯
NODE-002A,THEME-002,異常検知,ブレーキ警告灯が点灯している,走行中,"パーキングブレーキ作動|ブレーキ液不足|システム異常",0.9,
NODE-002B,THEME-002,判定,パーキングブレーキが解除されている,停車時,"ブレーキ液不足|システム異常",0.8,
NODE-002C,THEME-002,安全判断,走行を続けてよいか不安,警告灯点灯,"走行不可|販売店連絡",0.9,安全優先

# THEME-003 タイヤ空気圧警告灯
NODE-003A,THEME-003,異常検知,タイヤ空気圧警告灯が点灯している,走行中,"空気圧低下|急激な空気漏れ|センサー異常",0.9,
NODE-003B,THEME-003,判定,タイヤが明らかに潰れて見える,停車時,"急激な空気漏れ",0.9,
NODE-003C,THEME-003,対応選択,自分で対処したい,停車中,"空気補充|修理キット使用",0.7,

# THEME-004 エンジンがかからない
NODE-004A,THEME-004,異常検知,スタートボタンを押しても反応しない,始動操作,"キー認識不良|バッテリー上がり|操作手順誤り",0.9,
NODE-004B,THEME-004,判定,メーターが点灯しない,始動操作,"バッテリー上がり",0.9,
NODE-004C,THEME-004,対応選択,すぐに動かしたい,時間制約,"ジャンプスタート|ロードサービス",0.8,

# THEME-005 先進機能が動かない
NODE-005A,THEME-005,異常検知,先進機能が作動しない,機能使用時,"作動条件未達|一時停止状態|センサー汚れ",0.9,
NODE-005B,THEME-005,判定,天候が悪い,走行環境,"センサー汚れ|条件未達",0.8,
NODE-005C,THEME-005,理解促進,故障かどうか知りたい,警告表示,"正常仕様|条件説明",0.7,
```

---

## ②-2 判定条件（追補：ノード対応）

```csv
check_id,node_id,question,answer_type,answers,supports,notes
CHECK-001A,NODE-001A,メーター内のインジケーターは点灯しますか？,boolean,"yes|no","車両バッテリー上がり|スマートキー電池切れ",
CHECK-002A,NODE-002A,パーキングブレーキは解除されていますか？,boolean,"yes|no","ブレーキ液不足|パーキングブレーキ作動",
CHECK-003A,NODE-003A,タイヤが明らかに潰れて見えますか？,boolean,"yes|no","急激な空気漏れ|空気圧低下",
CHECK-004A,NODE-004A,メーターは点灯しますか？,boolean,"yes|no","キー認識不良|バッテリー上がり",
CHECK-005A,NODE-005A,フロント周辺は汚れていますか？,boolean,"yes|no","センサー汚れ|条件未達",
```

---

## ②-3 分岐（エッジ）例

```csv
edge_id,from_node_id,condition,condition_value,to_type,to_id,priority
EDGE-101,NODE-001A,CHECK-001A,no,guide,GUIDE-KEY-BATTERY,1
EDGE-201,NODE-002C,, ,guide,GUIDE-BRAKE-SAFETY,1
EDGE-301,NODE-003B,, ,guide,GUIDE-TIRE-EMERGENCY,1
EDGE-401,NODE-004B,, ,guide,GUIDE-BATTERY-ISSUE,1
EDGE-501,NODE-005B,, ,guide,GUIDE-SENSOR-CLEANING,1
```

---

## Step2 完了条件（重要）

- 各テーマで **「異常検知 → 判定 → 対応」** が最低1往復できる
- Node / Check / Edge が ID で接続されている
- 正解でなくても **辿れる**

この状態で、PoC・RAG接続・UXログ設計に進めます。

---

次は Step3：
- Intent（I1〜I6）を Node に付与
- AIガイド層が“2択提示”できる状態にする

に進めます。

---

# Step3：Intent（I1〜I6）付与と2択提案設計

本ステップでは、**各Journey NodeにユーザーIntentを付与**し、AIガイド層が
- いま推定されるIntent
- 安全側に倒した代替Intent

の**2択（Primary / Secondary）**を提示できる状態にします。

---

## ③-1 Intent Ontology（共通定義）

```csv
intent_code,intent_name,description,default_priority
I1,今すぐ使いたい,緊急で利用・解決したい,1
I2,原因を知りたい,なぜ起きているか理解したい,3
I3,自分で直したい,自力で対応したい,2
I4,壊したくない・安全優先,リスクを避けたい,1
I5,誰かに頼みたい,販売店・ロードサービスに依頼,2
I6,後で対応したい,当面の回避策が欲しい,4
```

---

## ③-2 Node × Intent マッピング（NodeIntent.csv）

> **原則**：各Nodeに
> - primary_intent（最有力）
> - secondary_intent（安全・代替）
> を1つずつ付与

```csv
node_id,primary_intent,secondary_intent,confidence,notes
# THEME-001 ドアが開かない
NODE-001A,I1,I4,0.9,まず開けたい＋破損回避
NODE-001B,I3,I1,0.8,電池交換を自力で
NODE-001C,I1,I5,0.7,即時開錠 or 依頼

# THEME-002 ブレーキ警告灯
NODE-002A,I4,I2,0.9,安全最優先
NODE-002B,I4,I5,0.9,走行可否判断
NODE-002C,I5,I4,0.95,連絡誘導

# THEME-003 タイヤ空気圧警告灯
NODE-003A,I2,I4,0.8,原因理解
NODE-003B,I4,I5,0.9,走行回避
NODE-003C,I3,I6,0.7,自力対応 or 後回し

# THEME-004 エンジンがかからない
NODE-004A,I1,I5,0.9,即時始動
NODE-004B,I5,I4,0.95,バッテリー問題
NODE-004C,I1,I5,0.85,ジャンプ or 依頼

# THEME-005 先進機能が動かない
NODE-005A,I2,I4,0.8,故障誤認回避
NODE-005B,I3,I2,0.7,清掃対応
NODE-005C,I2,I6,0.6,理解して後回し
```

---

## ③-3 Intent別 提案先（IntentAction.csv）

```csv
intent_code,action_type,action_id,priority,notes
I1,guide,GUIDE-EMERGENCY-OPEN,1,即時対応
I2,guide,GUIDE-CAUSE-EXPLANATION,2,理解促進
I3,guide,GUIDE-DIY-PROCEDURE,1,手順提示
I4,alert,ALERT-SAFETY-FIRST,1,注意喚起
I5,guide,GUIDE-CONTACT-SUPPORT,1,連絡誘導
I6,guide,GUIDE-TEMP-WORKAROUND,3,回避策
```

---

## ③-4 AIガイド層の2択提示ロジック（設計）

**Input**
- node_id
- context（時間帯・場所・過去履歴）

**Process**
1. NodeIntent から primary / secondary を取得
2. context で confidence を微調整
3. 上位2Intentを提示

**Output（UI例）**
- 「今すぐ開けたい」
- 「壊さず安全に対処したい」

---

## Step3 完了条件

- すべてのNodeに Intent が付与されている
- AIが **“説明ではなく選択肢”** を出せる
- Intentログがそのまま UXログになる

---

次は Step4：
- Intent × Guide の最適マッチング
- RAG検索キー（node_id + intent_code）の確定

に進めます。
