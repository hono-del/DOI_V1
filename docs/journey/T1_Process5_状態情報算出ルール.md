# T1 プロセス5：状態情報算出ルール

**対象**：T1（事象切り出し）のプロセス5「UX判断用の状態情報算出（緊急度・心理リスク等）」  
**目的**：event_id と文脈（context_labels）から **urgency**（緊急度）、**psychological_risk**（心理リスク）、**context_labels**（そのまま渡す／整形）、**evidence**（判断に使った兆候）を一貫したルールで算出するための仕様です。

---

## 1. 入力・出力の定義

### 1.1 プロセス5の入力（プロセス1〜4から受け取るもの）

| 入力項目 | 型 | 説明 | 例 |
|----------|-----|------|-----|
| event_id | string | 事象ID（プロセス2・3で確定） | DOOR_NOT_OPEN, WARNING_LAMP_ON |
| subtype | string \| null | 事象の細分類（あれば） | front_left_only, BRAKE |
| confidence | number (0〜1) | 事象として扱ってよい確度（プロセス4で算出） | 0.85 |
| context_labels | object | 意味ラベル化された文脈（プロセス1で正規化済み） | 下表参照 |
| 支持した兆候のリスト | array | プロセス1〜3で「この事象の根拠」として使った兆候ID | user_selected_symptom, unlock_fail_repeated |

**context_labels の取り得るキーと値（正規化済みを前提）**

| キー | 取り得る値 | 説明 |
|------|------------|------|
| time_band | day / night / unknown | 時間帯 |
| location_type | home / outside / highway / parking_lot / unknown | 場所の種類 |
| vehicle_state | stopped / moving / unknown | 走行状態 |
| occupant_context | none / child_in_vehicle / elderly / pet / unknown | 乗員・同乗者などの配慮要因 |
| weather | normal / severe / unknown | 天候（任意） |
| temperature_band | cold / normal / hot / unknown | 気温帯（任意） |

### 1.2 プロセス5の出力（T1最終出力の一部）

| 出力項目 | 型 | 説明 |
|----------|-----|------|
| urgency | number (0〜1) | 緊急度。0=不急、1=最大緊急。T5の行動並び順・質問優先に利用。 |
| psychological_risk | enum | low / medium / high。UX配慮レベル（安全・不安への配慮）。T5の表現・エスカレーション誘導に利用。 |
| context_labels | object | 入力の context_labels をそのまま渡す、またはキーを整えた形で渡す。 |
| evidence | array of string | 判断に使った主な兆候のIDリスト。トレーサビリティ・デバッグ用。 |

---

## 2. 緊急度（urgency）算出ルール

緊急度は **事象のデフォルト緊急度** に **文脈による加算・乗算** を適用し、0〜1 の範囲にクリップして算出する。

### 2.1 事象ごとのデフォルト緊急度（event_master 相当）

| event_id | default_urgency | 備考 |
|-----------|-----------------|------|
| DOOR_NOT_OPEN | 0.7 | 出られない／荷物が出せない等で中〜高 |
| WARNING_LAMP_ON | 0.8 | 安全関連のため高め |
| BT_NOT_CONNECTED | 0.4 | 利便性のため低め |

### 2.2 文脈による緊急度の加算（urgency_context_modifier）

次の条件に**最初に該当した1件**を適用する（複数該当時は優先度の高い方を採用）。  
加算後の値は `min(1.0, default_urgency + modifier)` でクリップする。

| 優先度 | 条件（context_labels） | 加算値 | 適用例 |
|--------|-------------------------|--------|--------|
| 1 | occupant_context = child_in_vehicle | +0.2 | 車内に子供がいる |
| 2 | time_band = night かつ location_type = outside | +0.15 | 夜・屋外 |
| 3 | time_band = night | +0.1 | 夜間 |
| 4 | location_type = highway かつ vehicle_state = moving | +0.15 | 走行中・高速（事象によっては該当しない） |
| 5 | location_type = outside | +0.05 | 屋外 |
| 6 | 上記いずれにも該当しない | 0 | 日中・自宅等 |

**注意**：事象によっては「走行中」で緊急度を下げるポリシーもあり得る（例：ドアが開かないは停止中のみ想定）。その場合は event_id ごとに「文脈ルールの有効/無効」を設ける。

### 2.3 緊急度算出式（疑似コード）

```
urgency_base = event_master[event_id].default_urgency
modifier = lookup_urgency_modifier(context_labels)  // 上表の加算値
urgency = min(1.0, urgency_base + modifier)
```

---

## 3. 心理リスク（psychological_risk）算出ルール

心理リスクは **事象のデフォルト心理リスク** をベースに、**文脈で1段階だけ上げる**かどうかを判定する。  
「low → medium」「medium → high」は許容するが、「low → high」は原則として文脈のみでは行わず、事象側のデフォルトで賄う。

### 3.1 事象ごとのデフォルト心理リスク（event_master 相当）

| event_id | default_psychological_risk | 備考 |
|-----------|-----------------------------|------|
| DOOR_NOT_OPEN | high | 閉じ込め・荷物取り出し不可等で不安になりやすい |
| WARNING_LAMP_ON | high | 安全不安 |
| BT_NOT_CONNECTED | low | 利便性の不満が主 |

### 3.2 文脈による心理リスクの1段階上げ条件

次のいずれかを満たす場合、デフォルトが low なら medium、medium なら high に**1段階だけ**上げる。  
もともと high の場合はそのまま high。

| 条件（context_labels） | 上げるか |
|-------------------------|----------|
| occupant_context = child_in_vehicle | 1段階上げ |
| occupant_context = elderly | 1段階上げ |
| time_band = night かつ location_type = outside | 1段階上げ |
| location_type = highway かつ vehicle_state = moving | 1段階上げ（事象が走行中に関連する場合） |
| 上記いずれにも該当しない | 上げない |

### 3.3 心理リスク算出式（疑似コード）

```
level_order = [ "low", "medium", "high" ]
base_index = index_of(event_master[event_id].default_psychological_risk, level_order)
if any_context_raises_risk(context_labels) and base_index < 2:
  base_index += 1
psychological_risk = level_order[base_index]
```

---

## 4. context_labels の受け渡しルール

- **原則**：プロセス1で正規化された context_labels を**そのまま**出力に含める。
- **整形する場合**：キー名をスキーマで統一する（例：time_band, location_type, vehicle_state のみに限定し、未使用キーは含めない）。
- **欠損**：存在しないキーは `unknown` または省略可。下流（T3・T5）では `unknown` は「加算・上げなし」として扱う。

---

## 5. evidence（判断に使った兆候）の組み立てルール

evidence は「この event_id を採用する根拠となった兆候」を列挙する。

### 5.1 兆候IDの例（事象共通）

| 兆候ID | 意味 |
|--------|------|
| user_selected_symptom | 困りごと選択でユーザーが事象を選択した |
| unlock_fail_repeated | 解錠失敗が短時間に複数回（操作ログ） |
| free_text_match | 自由文がキーワード／意図で事象にマッチした |
| warning_lamp_log | 警告灯の点灯ログ（車両／アプリ） |
| connection_fail_log | 接続失敗ログ（Bluetooth等） |

### 5.2 組み立てルール

1. **プロセス2で事象候補を出した経路**  
   ルールマッチなら「操作ログ系の兆候ID」、キーワード／意図マッチなら「free_text_match」を追加。
2. **困りごと選択**  
   「user_selected_symptom」を必ず含める。
3. **重複は除く**  
   同じ兆候IDは1回だけ列挙。
4. **最大件数**  
   実装都合で上限を設けてよい（例：最大5件）。優先順は「user_selected_symptom > 操作ログ系 > free_text_match」など。

**例（ドアが開かない）**  
- 選択あり＋解錠失敗ログあり → `["user_selected_symptom", "unlock_fail_repeated"]`  
- 操作ログのみ → `["unlock_fail_repeated"]`  
- 自由文のみ → `["free_text_match"]`

---

## 6. ルール一覧表（実装用）

以下はテーブル参照で実装する場合のマスタ案です。

### 6.1 事象マスタ（緊急度・心理リスク用）

| event_id | default_urgency | default_psychological_risk |
|----------|-----------------|-----------------------------|
| DOOR_NOT_OPEN | 0.7 | high |
| WARNING_LAMP_ON | 0.8 | high |
| BT_NOT_CONNECTED | 0.4 | low |

### 6.2 緊急度コンテキスト加算ルール（urgency_context_modifier）

| priority | condition_type | condition_value | modifier | 例 |
|----------|----------------|-----------------|----------|-----|
| 1 | occupant_context | child_in_vehicle | 0.2 | 車内に子供 |
| 2 | time_band + location_type | night, outside | 0.15 | 夜・屋外 |
| 3 | time_band | night | 0.1 | 夜間 |
| 4 | location_type + vehicle_state | highway, moving | 0.15 | 高速走行中 |
| 5 | location_type | outside | 0.05 | 屋外 |
| 0 | — | — | 0 | 該当なし |

※ condition は「キー＝値」のANDで評価。優先度の大きい方から評価し、最初にマッチした行の modifier を適用。

### 6.3 心理リスク1段階上げ条件（psychological_risk_bump）

| condition_type | condition_value | 説明 |
|----------------|-----------------|------|
| occupant_context | child_in_vehicle | 車内に子供 |
| occupant_context | elderly | 高齢者同乗 |
| time_band + location_type | night, outside | 夜・屋外 |
| location_type + vehicle_state | highway, moving | 高速走行中（事象による） |

※ いずれか1つでも該当すれば「1段階上げ」。もともと high は変更しない。

---

## 7. 算出例（ドアが開かない）

### 例1：日中・自宅・停止中・選択あり

- **入力**  
  event_id=DOOR_NOT_OPEN, context_labels={ time_band: day, location_type: home, vehicle_state: stopped }, 兆候=user_selected_symptom
- **緊急度**  
  base 0.7、該当なしで modifier 0 → **urgency = 0.7**
- **心理リスク**  
  デフォルト high、該当なし → **psychological_risk = high**
- **evidence**  
  **["user_selected_symptom"]**

### 例2：夜・駐車場・停止中・車内に子供・選択あり

- **入力**  
  event_id=DOOR_NOT_OPEN, context_labels={ time_band: night, location_type: outside, vehicle_state: stopped, occupant_context: child_in_vehicle }, 兆候=user_selected_symptom, unlock_fail_repeated
- **緊急度**  
  base 0.7。優先度1「child_in_vehicle」で +0.2 → **urgency = min(1.0, 0.9) = 0.9**
- **心理リスク**  
  デフォルト high、child_in_vehicle で1段階上げ対象だが既に high → **psychological_risk = high**
- **evidence**  
  **["user_selected_symptom", "unlock_fail_repeated"]**

### 例3：夜・屋外・停止中（子供なし）

- **入力**  
  event_id=DOOR_NOT_OPEN, context_labels={ time_band: night, location_type: outside, vehicle_state: stopped }
- **緊急度**  
  base 0.7。優先度2「night + outside」で +0.15 → **urgency = 0.85**
- **心理リスク**  
  デフォルト high のためそのまま **psychological_risk = high**

---

## 8. 参照

- T1 定義：`T1_Event_Detection_Definition.md`
- T1 プロセス全体：`T1-T6_Process_Consolidation.md`
- 事象別具体（ドアが開かない）：`THEME_DOOR_NOT_OPEN_Process_Detail.md`
- 実装データ・ルール：`T1-T6_実装に必要なデータとルール.md`
- マスタ例：`csv_data/t1t6_master/event_master.csv`
