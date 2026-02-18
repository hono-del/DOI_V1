# 「ドアが開かない」事象のプロセス整理

テーマ：**ドアが開かない**（スマートキー想定）  
`T1-T6_Process_Consolidation.md` の構成に沿い、この事象に特化したインプット・計算・処理・アウトプットを整理したものです。

---

## 前提（この事象で扱う範囲）

- **事象**：スマートキーでドアが開かない（解錠できない）
- **想定ユーザー操作**：困りごと選択「ドアが開かない」、または解錠操作の繰り返し
- **subtype の例**：開かないドアの位置（フロント左／全ドア等）、操作手段（リモートのみ／ハンドルのみ等）、症状の出方（全く反応しない／ランプは点くが開かない等）。本整理では subtype は省略可能として記載。

---

## T1：事象切り出し（ドアが開かない）

**処理の位置づけ**：推論ではなく、分類と整理。

---

### プロセス 1：兆候の正規化・ラベル化（Feature化）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 後続の候補生成・確度算出の入力として統一形式が必要なため。 |
| **活用するインプット** | 困りごと選択「ドアが開かない」、操作ログ（解錠ボタン 3回/20秒、解錠失敗 2回）、文脈（時間帯・位置・走行状態＝停止中等）。 |
| **計算・処理** | 選択を「symptom=door_not_open」にラベル化。操作ログから「unlock_fail_count=2」「unlock_attempt_count=3」「time_window_sec=20」を抽出。時刻・位置は time_band（night 等）、location_type（outside 等）、vehicle_state=stopped に正規化。 |
| **アウトプット** | features：symptom=door_not_open, unlock_fail_count=2, unlock_attempt_count=3, time_window_sec=20, time_band, location_type, vehicle_state。事象候補生成へ渡す。 |

---

### プロセス 2：ルール＋軽い分類による事象候補生成

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **選択入力のみのときは省略可**。自由文・操作ログのみのときは必須。 |
| **理由** | 選択入力のみのときは選択→event_id の1対1マッピングで足りるため。自由文・操作ログのみのときは event_id を決めるために必要。 |
| **活用するインプット** | プロセス1の features（unlock_fail_count, time_window_sec, symptom 等）。ルール例：unlock_fail >= 2 within 30s → DOOR_NOT_OPEN 候補。 |
| **計算・処理** | ルール「unlock_fail >= 2 within 30s」を満たすため DOOR_NOT_OPEN を候補として出力。困りごと選択が「ドアが開かない」のため候補は 1 つに収束。 |
| **アウトプット** | 事象ID候補：DOOR_NOT_OPEN。 |

---

### プロセス 3：兆候の重なりを集約

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **候補1つのときは省略可**。複数候補のときは必須。 |
| **理由** | 候補1つのときは集約するまでもないため。複数候補のときは event_id を1つに絞るために必要。 |
| **活用するインプット** | プロセス2の候補（DOOR_NOT_OPEN）。プロセス1の features（ユーザー選択＋解錠失敗の重なり）。 |
| **計算・処理** | 候補が 1 つのためそのまま採用。subtype を出す場合は「開かないドアの位置」「操作手段」等をここで決定（本件では省略可）。 |
| **アウトプット** | event_id=DOOR_NOT_OPEN。subtype（あれば）。confidence 算出へ。 |

---

### T1 プロセス1・2・3 がスキップできない具体ケース（ドアが開かない）

「ドアが開かない」では**困りごと選択のみ・候補1つ**のシンプルな経路が多く、プロセス1・2・3を簡略化しても成立しがちです。  
一方で、**複雑な入力・複数候補・曖昧な表現**が混ざるケースでは、各プロセスをきちんと実行しないと誤った event_id や subtype に繋がります。  
以下は「スキップすると成立しない／誤る」例として参照できる具体ケースです。

---

#### プロセス 1（兆候の正規化・ラベル化）が必須になる具体ケース

| ケース | 入力の様子 | プロセス1をスキップすると | プロセス1でやること |
|--------|------------|---------------------------|---------------------|
| **A. 操作ログのみで事象を推す** | ユーザーは「ドアが開かない」を選んでいない。アプリ内で解錠ボタン連打・失敗ログのみ（例：unlock_attempt=5, unlock_fail=4, 30秒窓）。 | 生ログのままではプロセス2のルール（unlock_fail >= 2 within 30s 等）に渡せず、DOOR_NOT_OPEN 候補を出せない。 | ログを `unlock_fail_count`, `unlock_attempt_count`, `time_window_sec` に正規化。時刻・位置を `time_band`, `location_type`, `vehicle_state` にラベル化して features にまとめる。 |
| **B. 自由文＋操作ログの混在** | 「鍵が効かなくて困ってます」「リモコン押しても開かない」＋ 解錠失敗2回のログ。 | 文言とログが別形式のままでは、後続の「どの兆候を支持したか」の根拠（evidence）や confidence 算出ができない。 | 「鍵が効かない」「リモコンで開かない」を symptom 系ラベルに正規化。ログを同じ features 形式に揃え、evidence の出所を一貫させる。 |
| **C. 文脈で緊急度・心理リスクを変えたい** | 「ドアが開かない」選択＋深夜・駐車場・車内に子供。 | 生の「深夜」「駐車場」「車内に子供」のままでは、T1 出力の urgency・psychological_risk をルールで算出できない。 | 時刻→time_band(night)、場所→location_type(outside)、乗員情報→乗員コンテキストラベルに正規化し、プロセス5で緊急度・心理リスクを一貫して算出。 |

**まとめ**：入力が「困りごと選択だけ」で、操作ログ・自由文・詳細文脈を使わない場合はプロセス1を軽くできるが、**ログのみ／自由文混在／文脈で出し分けする**いずれかのケースでは、プロセス1の正規化・ラベル化が必須。

---

#### プロセス 2（ルール＋軽い分類による事象候補生成）が必須になる具体ケース

| ケース | 入力の様子 | プロセス2をスキップすると | プロセス2でやること |
|--------|------------|---------------------------|---------------------|
| **D. 操作ログのみ（選択なし）** | ユーザーは何も選ばず、解錠失敗が 2 回 within 30秒 のログだけが来る。 | 選択→event_id の 1 対 1 がないため、DOOR_NOT_OPEN を出せない。 | ルール「unlock_fail >= 2 within 30s → DOOR_NOT_OPEN」を適用し、事象候補を 1 つ生成する。 |
| **E. 自由文のみ** | 「リモコン押してもドアが開かない」「鍵が反応しない」のみ。困りごと選択は未使用。 | 文言から event_id を決める処理がなく、事象が不定のまま。 | 軽い分類（キーワード／意図）で「解錠できない」系と判定し、DOOR_NOT_OPEN を候補として出力する。 |
| **F. 他事象と紛れやすい表現** | 「車に入れない」「鍵がかからない」等。エンジン始動不良（ENGINE_NOT_START）やセキュリティアラーム（ALARM_ACTIVATED）とも解釈しうる。 | 1 対 1 で DOOR_NOT_OPEN に飛ぶと、実際は「エンジンがかからない」や「アラームで開けない」を誤って DOOR_NOT_OPEN にしてしまう。 | ルール＋軽い分類で「解錠不良」に紐づく兆候（unlock_fail、鍵・リモコン言及）を評価し、DOOR_NOT_OPEN を**候補の一つ**として出す。複数候補になり得る場合はプロセス3に渡す。 |

**まとめ**：**困りごと選択のみ**で「ドアが開かない」が明示されている経路ではプロセス2は省略可能。**操作ログのみ／自由文のみ／他事象と紛れる表現**のいずれかなら、プロセス2の候補生成が必須。

---

#### プロセス 3（兆候の重なりを集約）が必須になる具体ケース

| ケース | 入力の様子 | プロセス3をスキップすると | プロセス3でやること |
|--------|------------|---------------------------|---------------------|
| **G. 複数事象候補が同時に出る** | 操作ログで DOOR_NOT_OPEN が立つ一方、ユーザーが「エンジンがかからない」も選択（または自由文で両方言及）。プロセス2の出力が [DOOR_NOT_OPEN, ENGINE_NOT_START]。 | 候補が 2 つのままでは、T2 以降で「どちらの事象で原因候補を引くか」が決まらない。 | 兆候の重なり（選択 vs ログの一致度・時間的近接）を評価し、主事象を 1 つに絞る。例：解錠失敗ログが直近なら DOOR_NOT_OPEN を採用し、ENGINE_NOT_START は保留または別フローへ。 |
| **H. ドア＋トランクなど複数部位** | 「ドアもトランクも開かない」と入力。プロセス2で [DOOR_NOT_OPEN, TRUNK_NOT_OPEN] が出る。 | 2 つの event_id を同時に扱うと、T2 の原因候補・T3 の質問が事象ごとに分かれ、フローが二重化する。 | 兆候の強さ・ユーザーの主訴（最初に選んだ／最初に言及した）で 1 つに集約。例：DOOR_NOT_OPEN を主、TRUNK_NOT_OPEN は subtype やメモに回す。 |
| **I. subtype を決めたい複合兆候** | 「フロント左だけ開かない」「リモコンは効くがハンドルだと開かない」等。同じ DOOR_NOT_OPEN でも、原因候補・質問が変わる。 | 候補 1 つでも「どの DOOR_NOT_OPEN か」を決めないと、T2／T3 で不要な原因・質問が出る。 | 兆候の重なりから「開かないドアの位置」「操作手段別の有無」を集約し、subtype（例：front_left_only, remote_ok_handle_ng）を 1 つに決める。 |

**まとめ**：**事象候補が 1 つ**で subtype も不要な単純ケースではプロセス3は省略可。**複数 event_id 候補／複数部位／subtype で原因・質問を出し分けする**場合は、プロセス3の集約が必須。

---

#### 複雑ケースの例：プロセス1・2・3をすべて通す必要があるシーン

**例：深夜の駐車場で「鍵が効かない。リモコンもダメだった」と自由文＋解錠失敗ログ**

1. **プロセス1**  
   自由文を「解錠不良」系ラベルに、ログを unlock_fail_count / time_window_sec 等に正規化。時刻・場所を time_band(night), location_type(outside) にラベル化。  
   → やらないと、後続が「何を根拠に DOOR_NOT_OPEN か」「緊急度をどう見るか」を揃えられない。

2. **プロセス2**  
   選択がないため、ルール（解錠失敗ログ）＋軽い分類（「鍵が効かない」「リモコンもダメ」）から DOOR_NOT_OPEN を候補として生成。  
   → やらないと、event_id が決まらない。

3. **プロセス3**  
   この例では候補は 1 つだが、subtype（「リモコンもダメ」→ リモート・ハンドル両方の情報）を集約すると、T2／T3 で「キー電池／電波干渉／車両側」の切り分けに使える。  
   → 候補が複数あるバリエーション（例：同じユーザーが「エンジンもかからない」と書いている場合）では、ここで 1 つに絞る必要がある。

このように、**自由文＋操作ログ＋文脈**が揃う複雑なケースでは、T1 のプロセス1・2・3をひとつずつ通すことで、正しい event_id・subtype と、後続の T2～T5 で使える evidence・文脈が揃います。

---

### プロセス 4：事象ラベルごとの確度（confidence）算出

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | T1出力として後続・UXで利用するため。 |
| **活用するインプット** | event_id=DOOR_NOT_OPEN。支持する兆候：user_selected_symptom（困りごと選択）、unlock_fail_repeated（解錠失敗 2 回 within 20s）。 |
| **計算・処理** | ユーザー選択＋解錠失敗の重なりから「DOOR_NOT_OPEN として扱ってよい確度」を算出。例：選択あり＋失敗2回 → 0.85。 |
| **アウトプット** | confidence=0.85（例）。T1 最終出力の一部。 |

---

### プロセス 5：UX判断用の状態情報算出（緊急度・心理リスク等）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 緊急度・心理リスクは T5・UX 判断に必要なため。 |
| **活用するインプット** | context_labels（time_band, location_type, vehicle_state）、event_id=DOOR_NOT_OPEN、confidence。事象「ドアが開かない」の緊急度・心理リスクルール。 |
| **計算・処理** | ドアが開かないは「出られない／荷物が出せない」等で心理リスク高になりやすいため psychological_risk=high。時間帯・屋外等で urgency=0.7 等を付与。evidence に user_selected_symptom, unlock_fail_repeated を列挙。**詳細な算出ルール**は `T1_Process5_状態情報算出ルール.md` を参照。 |
| **アウトプット** | urgency=0.7、psychological_risk=high、context_labels、evidence。T1 の最終出力として T2 へ。 |

---

**T1 の最終アウトプット（ドアが開かない）**

- event_id=DOOR_NOT_OPEN  
- subtype（あれば）  
- confidence=0.85  
- urgency=0.7  
- psychological_risk=high  
- context_labels（time_band, location_type, vehicle_state）  
- evidence=[user_selected_symptom, unlock_fail_repeated]

---

## T2：原因候補列挙（ドアが開かない）

**処理の位置づけ**：原因候補の列挙と整理。

---

### プロセス 1：知識ベース検索で事象に紐づく原因を取得

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 原因候補が無いと T3・T4・T5 が動かないため。 |
| **活用するインプット** | T1出力の event_id=DOOR_NOT_OPEN。マニュアル・トラブルシュート表（スマートキー解錠不良の原因一覧）。 |
| **計算・処理** | DOOR_NOT_OPEN（スマートキー想定）をキーに検索し、起こり得る原因を取得：キー電池切れ、キー故障、電波干渉、車両12V低下、ドアロック故障、操作条件不一致 等。 |
| **アウトプット** | 原因の粗いリスト（KEY_BATTERY_EMPTY, KEY_FAULT, RADIO_INTERFERENCE, VEHICLE_12V_LOW, LOCK_ACTUATOR_FAULT, USER_OPERATION 等）。車種フィルタ前。 |

---

### プロセス 2：車種・装備でフィルタ（その車に存在しない原因を落とす）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（車種未取得時はスキップ可） |
| **理由** | その車に存在しない原因を除外しないと不適切な質問・行動が出るため。 |
| **活用するインプット** | プロセス1の原因リスト。車種・年式・グレード・地域仕様・装備（スマートキー／キーレス有無、ドアロック仕様等）。 |
| **計算・処理** | スマートキー非装備車では本事象は別扱いとする等。該当車では上記原因はほぼすべて存在し得るため、大きな除外は行わずリストを維持。過去にキー電池交換直後等の履歴があれば優先度調整は可能。 |
| **アウトプット** | フィルタ済み原因候補：KEY_BATTERY_EMPTY, RADIO_INTERFERENCE, VEHICLE_12V_LOW, LOCK_ACTUATOR_FAULT, USER_OPERATION（＋KEY_FAULT 等）。 |

---

### プロセス 3：各候補にメタ情報を付与（原因ID、説明、必要観察、危険度、対処群）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | T3 の質問選定・T4 の確率・T5 の行動選択に必要なため。 |
| **活用するインプット** | プロセス2の原因リスト。知識ベースの「必要観察」「危険度」「対処群」。 |
| **計算・処理** | 各 cause_id に description、required_observations、risk_level、action_group を付与。例：KEY_BATTERY_EMPTY → required_observations=[key_indicator_light], risk_level=low, action_group=battery_replace。LOCK_ACTUATOR_FAULT → risk_level=medium, action_group=dealer。 |
| **アウトプット** | cause_candidates[]（下表のイメージ）。T3・T4 へ渡す。 |

**cause_candidates 例（ドアが開かない）**

| cause_id | description | required_observations | risk_level | action_group |
|----------|-------------|------------------------|------------|--------------|
| KEY_BATTERY_EMPTY | キー電池切れ | key_indicator_light | low | battery_replace |
| RADIO_INTERFERENCE | 電波干渉 | key_indicator_light, location | low | retry_or_relocate |
| VEHICLE_12V_LOW | 車両12V低下 | key_indicator_light, vehicle_12v | low | jump_start / dealer |
| LOCK_ACTUATOR_FAULT | ドアロック故障 | other_key_result | medium | dealer |
| USER_OPERATION | 操作条件不一致 | key_indicator_light, operation_condition | low | guide |

---

### プロセス 4：リストをT3・T4が参照できる形式で出力

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | T3・T4 が参照する形式で渡すため。 |
| **活用するインプット** | プロセス3の cause_candidates[]。 |
| **計算・処理** | スキーマに沿って JSON 等に整え、T3・T4 が利用しやすい形で出力。 |
| **アウトプット** | cause_candidates[]（T2 の最終出力）。 |

---

**T2 の最終アウトプット（ドアが開かない）**：cause_candidates[]（上表に対応する配列）。

#### T2 最終アウトプット例（JSON形式）

```json
{
  "theme_id": "THEME-002",
  "theme_name": "ドアが開かない",
  "timestamp": "2026-02-18T10:30:45Z",
  "vehicle_id": "VEH-12345",
  "cause_candidates": [
    {
      "candidate_id": "C001",
      "cause_id": "KEY_BATTERY_EMPTY",
      "cause_name": "キー電池切れ",
      "category": "電源系要因",
      "priority": "high",
      "initial_plausibility": 0.85,
      "related_components": ["スマートキー", "キー電池（CR2032）"],
      "related_dtcs": [],
      "generation_basis": {
        "state_info": {
          "key_indicator_light": "off",
          "unlock_attempt_count": 3,
          "unlock_fail_count": 2
        },
        "historical_patterns": ["過去20件の類似事例で85%の確率"],
        "rule_triggered": "RULE-KB-001: キーランプ消灯+解錠失敗"
      },
      "required_observations": ["key_indicator_light"],
      "risk_level": "low",
      "action_group": "battery_replace"
    },
    {
      "candidate_id": "C002",
      "cause_id": "RADIO_INTERFERENCE",
      "cause_name": "電波干渉",
      "category": "環境要因",
      "priority": "medium",
      "initial_plausibility": 0.65,
      "related_components": ["スマートキー", "車両アンテナ"],
      "related_dtcs": [],
      "generation_basis": {
        "state_info": {
          "location_type": "urban_area",
          "key_indicator_light": "on",
          "signal_strength": "weak"
        },
        "historical_patterns": ["都市部で過去15件発生、40%の確率"],
        "rule_triggered": "RULE-RF-002: 都市部+キーランプ点灯+解錠失敗"
      },
      "required_observations": ["key_indicator_light", "location"],
      "risk_level": "low",
      "action_group": "retry_or_relocate"
    },
    {
      "candidate_id": "C003",
      "cause_id": "VEHICLE_12V_LOW",
      "cause_name": "車両12V低下",
      "category": "電源系要因",
      "priority": "medium",
      "initial_plausibility": 0.55,
      "related_components": ["バッテリ", "電源系統"],
      "related_dtcs": ["B1001"],
      "generation_basis": {
        "state_info": {
          "battery_voltage": 11.5,
          "last_drive": "7_days_ago",
          "key_indicator_light": "dim"
        },
        "historical_patterns": ["長期駐車後に過去10件発生、50%の確率"],
        "rule_triggered": "RULE-12V-003: バッテリ電圧低下+長期駐車"
      },
      "required_observations": ["key_indicator_light", "vehicle_12v"],
      "risk_level": "low",
      "action_group": "jump_start_or_dealer"
    },
    {
      "candidate_id": "C004",
      "cause_id": "LOCK_ACTUATOR_FAULT",
      "cause_name": "ドアロックアクチュエータ故障",
      "category": "機械的要因",
      "priority": "medium",
      "initial_plausibility": 0.50,
      "related_components": ["ドアロックアクチュエータ", "ロック機構"],
      "related_dtcs": ["B1234", "B1235"],
      "generation_basis": {
        "state_info": {
          "actuator_current": 0.0,
          "lock_switch_status": "unlock_command_detected",
          "mechanical_engagement": "stuck"
        },
        "historical_patterns": ["過去5件の類似事例で40%の確率"],
        "rule_triggered": "RULE-LA-004: アクチュエータ電流異常+ロック解除コマンド検知"
      },
      "required_observations": ["other_key_result"],
      "risk_level": "medium",
      "action_group": "dealer"
    },
    {
      "candidate_id": "C005",
      "cause_id": "USER_OPERATION",
      "cause_name": "操作条件不一致",
      "category": "操作要因",
      "priority": "low",
      "initial_plausibility": 0.40,
      "related_components": ["スマートキー", "車両システム"],
      "related_dtcs": [],
      "generation_basis": {
        "state_info": {
          "key_distance": "too_far",
          "door_handle_operation": "not_detected",
          "key_indicator_light": "on"
        },
        "historical_patterns": ["初回ユーザーで過去8件発生、30%の確率"],
        "rule_triggered": "RULE-OP-005: キー距離遠い+ハンドル操作不検知"
      },
      "required_observations": ["key_indicator_light", "operation_condition"],
      "risk_level": "low",
      "action_group": "guide"
    },
    {
      "candidate_id": "C006",
      "cause_id": "KEY_FAULT",
      "cause_name": "キー本体の故障",
      "category": "機械的要因",
      "priority": "low",
      "initial_plausibility": 0.30,
      "related_components": ["スマートキー内部回路"],
      "related_dtcs": [],
      "generation_basis": {
        "state_info": {
          "key_indicator_light": "off",
          "key_button_response": "none",
          "physical_damage": "suspected"
        },
        "historical_patterns": ["過去3件の類似事例で20%の確率"],
        "rule_triggered": "RULE-KF-006: キーランプ消灯+ボタン無反応"
      },
      "required_observations": ["key_indicator_light", "other_key_result"],
      "risk_level": "low",
      "action_group": "dealer"
    }
  ],
  "metadata": {
    "total_candidates": 6,
    "generation_method": "hybrid",
    "computation_time_ms": 185,
    "confidence_threshold_applied": 0.3,
    "ready_for_t3": true,
    "knowledge_base_version": "v2.1.0"
  }
}
```

**アウトプット構造の説明**

### 最上位レベル
- **theme_id, theme_name**: どのテーマに対する候補か
- **timestamp**: 生成時刻
- **vehicle_id**: 対象車両
- **cause_candidates[]**: 原因候補のリスト（メイン）

### 各候補の構造（cause_candidates[]の要素）

1. **識別情報**
   - `candidate_id`: 候補の一意識別子（この推論セッション内）
   - `cause_id`: 原因の種別ID（知識ベース上の分類）
   - `cause_name`: 原因の名称
   - `category`: カテゴリ分類（電源系／機械的／環境／操作等）

2. **T3・T4向けの判断材料**
   - `priority`: 優先度（T3の選択判断に使用）
   - `initial_plausibility`: 初期尤度（T4のスコアリングベースに使用）

3. **関連情報**
   - `related_components`: 関連部品リスト
   - `related_dtcs`: 関連するDTC（診断トラブルコード）

4. **根拠情報（generation_basis）**
   - `state_info`: この候補を生成する根拠となった状態情報
   - `historical_patterns`: 過去事例からの根拠
   - `rule_triggered`: 適用されたルール

5. **T3向けの観察情報**
   - `required_observations`: T3で質問候補を選ぶ際に参照する観察点
   - `risk_level`: 危険度（T3の禁則チェック、T5の行動選定に使用）
   - `action_group`: 対処群（T5の行動列挙に使用）

### メタデータ
- `total_candidates`: 候補総数
- `generation_method`: 生成手法（ルールベース／統計／ハイブリッド等）
- `computation_time_ms`: 計算時間
- `confidence_threshold_applied`: 候補に含めた最低信頼度の閾値
- `ready_for_t3`: T3に渡せる状態かどうか
- `knowledge_base_version`: 使用した知識ベースのバージョン

**T3・T4での活用**

- **T3（観察点選定）**: `required_observations` を見て各原因が必要とする観察点を集約し、情報利得の高い質問を選ぶ。`priority` で緊急度の高い原因に関わる質問を優先。
- **T4（仮説評価）**: `initial_plausibility` を事前確率とし、T3の回答に基づいて事後確率を更新。`generation_basis.state_info` と回答を照合して条件一致度を算出。

---

## T3：観察点選定（ドアが開かない）

**処理の位置づけ**：聞くべき 1 問の選定。原因分布を一気に割る最初の質問を選ぶ。

---

### プロセス 1：事象に紐づく原因候補（T2の出力）を取得

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（T3 を実行する場合） |
| **理由** | 質問選定の対象が無いと T3 が成立しないため。 |
| **活用するインプット** | T2出力の cause_candidates[]。T1の event_id=DOOR_NOT_OPEN、context_labels。 |
| **計算・処理** | cause_candidates をそのまま参照。required_observations から「キーランプの有無」が多くの原因で共通して効く観察であることを利用。 |
| **アウトプット** | 原因リストと観察候補の集合。次の情報利得評価へ。 |

**出力例**
- cause_ids: [KEY_BATTERY_EMPTY, RADIO_INTERFERENCE, VEHICLE_12V_LOW, LOCK_ACTUATOR_FAULT, USER_OPERATION]
- 観察候補: [key_indicator_light, location, other_key_result]

---

### プロセス 2：各候補質問の「情報利得」を評価（原因分布をどれだけ割れるか）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（T3 を実行する場合） |
| **理由** | 聞くべき1問を決めるため。 |
| **活用するインプット** | プロセス1の原因候補と required_observations。故障木（ランプ点灯の有無でキー側／車両側に分かれる）。 |
| **計算・処理** | 候補質問「スマートキーのボタンを押すとランプは点きますか？」（Yes/No）を評価。No → キー電池・キー故障側に強く寄る。Yes → 車両側・電波干渉・操作条件側。この 1 問で原因分布を大きく分割できるため情報利得が高い。 |
| **アウトプット** | この質問を最優先とするスコア or 順位。禁則チェックへ。 |

**出力例**
- 採用質問: 「ランプは点きますか？」
- 情報利得スコア: 0.85（最優先）

---

### プロセス 3：禁則チェック（危険・曖昧・負荷過大の質問を除外）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（安全な事象のみのときは簡略可） |
| **理由** | 危険・曖昧な質問を出さないため。 |
| **活用するインプット** | 上記 1 問（キーランプの点灯有無）。緊急度・文脈（停止中）。禁則ルール。 |
| **計算・処理** | 質問は「キーを手に取ってボタンを押す」だけであり、危険・曖昧・負荷過大に該当しないため除外しない。 |
| **アウトプット** | 出してよい質問として採用。優先順位調整へ。 |

**出力例**
- 採用: question_id "Q_DOOR_001"（キーランプ点灯有無）
- 禁則: 該当なし

---

### プロセス 4：緊急度・文脈に応じた質問順の調整

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（質問1つのときは簡略可） |
| **理由** | 最初に出す質問を決めるため。 |
| **活用するインプット** | 採用した質問。T1の urgency、context_labels（停止中等）。事象「ドアが開かない」の質問優先順ルール。 |
| **計算・処理** | ドアが開かないでは「キーランプの有無」が最初の 1 問として標準的。警告灯事象のような「色・点滅」のような優先順は不要。この 1 問を優先順位 1 とする。 |
| **アウトプット** | 優先順位付きの 1 問。次の「expected_split 生成」へ。 |

**出力例**
- priority: 1
- question: 「スマートキーのボタンを押すとランプは点きますか？」

---

### プロセス 5：1問を選び、question_text / answer_type / expected_split を生成

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（T3 を実行する場合） |
| **理由** | T4 の確率更新と UX の質問表示に必要なため。 |
| **活用するインプット** | 採用した質問。原因候補と回答値の対応（故障木）。 |
| **計算・処理** | question_id=Q_DOOR_001、question_text=「スマートキーのボタンを押すとランプは点きますか？」、answer_type=yes_no。expected_split：No → [KEY_BATTERY_EMPTY, KEY_FAULT]、Yes → [RADIO_INTERFERENCE, VEHICLE_12V_LOW, USER_OPERATION, LOCK_ACTUATOR_FAULT] 等。 |
| **アウトプット** | question_id, question_text, answer_type, expected_split, priority。T3 の最終出力として T4 と UX に渡す。 |

**出力例（T3 最終出力）**
```
question_id: "Q_DOOR_001"
question_text: "スマートキーのボタンを押すとランプは点きますか？"
answer_type: "yes_no"
expected_split:
  no: [KEY_BATTERY_EMPTY, KEY_FAULT]
  yes: [RADIO_INTERFERENCE, VEHICLE_12V_LOW, USER_OPERATION, LOCK_ACTUATOR_FAULT]
priority: 1
```

---

**T3 の最終アウトプット（ドアが開かない）**

- question_id=Q_DOOR_001  
- question_text=「スマートキーのボタンを押すとランプは点きますか？」  
- answer_type=yes_no  
- expected_split：No → キー電池/キー故障側、Yes → 車両側/電波干渉/操作条件側  
- priority=1  

---

## T4：仮説評価・順位付け（ドアが開かない）

**処理の位置づけ**：確率更新と状態判定。T3 の回答に応じて原因の確信度を更新し、次の一手を決める。

---

### プロセス 1：観察結果を expected_split（T3の出力）と照合し、各原因の条件一致度を算出

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（T3 の回答がある場合） |
| **理由** | 原因の確信度を更新するため。 |
| **活用するインプット** | ユーザーの回答（例：Q1=No、ランプは点かない）。T3の expected_split（No → KEY_BATTERY_EMPTY, KEY_FAULT 等）。T2の cause_candidates[]。 |
| **計算・処理** | answer=No に対応する枝 expected_split.no に含まれる原因に条件一致度 1（または高）、それ以外に 0（または低）を付与。KEY_BATTERY_EMPTY, KEY_FAULT が支持され、他は弱まる。 |
| **アウトプット** | 原因ごとの条件一致度（KEY_BATTERY_EMPTY, KEY_FAULT が高、他が低）。事後確率更新へ。 |

**出力例**
- KEY_BATTERY_EMPTY: 1（高）、KEY_FAULT: 1（高）
- RADIO_INTERFERENCE, VEHICLE_12V_LOW, LOCK_ACTUATOR_FAULT, USER_OPERATION: 0（低）

---

### プロセス 2：事前確率（または前ラウンドの確率）と組み合わせて事後確率を更新

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 確信度が無いと T5 で行動を選べないため。 |
| **活用するインプット** | プロセス1の条件一致度。事前確率（一様 or 統計：キー電池切れは頻度が高い等）。 |
| **計算・処理** | 事前確率 × 条件一致度を正規化。Q1=No の場合、KEY_BATTERY_EMPTY を 0.70、KEY_FAULT を 0.15、OTHER を 0.15 等に更新（値は設計に依存）。 |
| **アウトプット** | 原因ごとの確信度（0～1）。順位付けへ。 |

**出力例**
- KEY_BATTERY_EMPTY: 0.70、KEY_FAULT: 0.15、OTHER: 0.15

---

### プロセス 3：確信度で順位付けし、ranked_causes[] を生成

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | T5 の行動列挙に必要なため。 |
| **活用するインプット** | プロセス2の確信度。cause_id、evidence（key_indicator_light=no）。 |
| **計算・処理** | 確信度の降順でソート。各要素に cause_id、confidence、evidence を付与。 |
| **アウトプット** | ranked_causes[]。例：1位 KEY_BATTERY_EMPTY 0.70、2位 KEY_FAULT 0.15、3位 OTHER 0.15。status 決定へ。 |

**出力例**
```
ranked_causes: [
  { cause_id: "KEY_BATTERY_EMPTY", confidence: 0.72, evidence: ["key_indicator_light=no"] },
  { cause_id: "KEY_FAULT", confidence: 0.15, evidence: ["key_indicator_light=no"] },
  { cause_id: "OTHER", confidence: 0.13, evidence: [] }
]
```

---

### プロセス 4：しきい値と危険度に応じて status を決定

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 対処に進むか・追加観察か・エスカレーションかを決めるため。 |
| **活用するインプット** | ranked_causes[] の上位確信度（0.70 等）。cause_candidates の risk_level（いずれも low/medium）。しきい値（例：上位が 0.5 超で READY_FOR_ACTION）。 |
| **計算・処理** | 上位原因の確信度が「対処に進んでよい」しきい値を超えているため status=READY_FOR_ACTION。危険度は高くないため ESCALATE にはしない。 |
| **アウトプット** | status=READY_FOR_ACTION。T4 の最終出力として T5 へ。 |

**出力例**
- status: "READY_FOR_ACTION"
- ranked_causes は上記のまま T5 へ渡す

---

**T4 の最終アウトプット（ドアが開かない・Q1=No の例）**

- ranked_causes[]：KEY_BATTERY_EMPTY 0.70、KEY_FAULT 0.15、OTHER 0.15  
- status=READY_FOR_ACTION  

---

## T5：行動選択（ドアが開かない）

**処理の位置づけ**：選択肢の絞り込みと表現。T4 の仮説・T1 の文脈・T2 のリスクを参照し、最大 3 つの行動案を出す。

---

### プロセス 1：仮説の action_group とリスクに基づき、取り得る行動を列挙

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | ユーザーに提示する選択肢を出すため。 |
| **活用するインプット** | T4の ranked_causes 上位（KEY_BATTERY_EMPTY, KEY_FAULT）と action_group（battery_replace 等）。T2の risk_level。知識ベースの「ドアが開かない」推奨行動。 |
| **計算・処理** | 一次解決：機械キーで解錠（今すぐ開ける）。恒久対応：電池交換（battery_replace）、販売店・ロードサービス（dealer）。リスクに応じて「販売店での交換を推奨」等を付与。 |
| **アウトプット** | 行動候補：①機械キー解錠 ②電池交換 ③販売店/ロードサービス。次のスコア付けへ。 |

---

### プロセス 2：目的関数（即効性×安全×負荷×成功率）でスコア付けし、最大3つに絞る

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 最大3つに絞り、並び順を決めるため。 |
| **活用するインプット** | プロセス1の 3 候補。T1の urgency、psychological_risk、context_labels（屋外・夜等）。ユーザープロファイル（あれば）。 |
| **計算・処理** | 即効性が高い「機械キー解錠」、恒久の「電池交換」、不安時の「販売店/ロードサービス」の 3 つをそのまま採用（すでに 3 つ）。urgency が高ければ機械キーを先頭に。スコアで並び順を確定。 |
| **アウトプット** | 最大 3 つの行動（並び順確定）。一次解決／恒久対応の区別へ。 |

---

### プロセス 3：一次解決と恒久対応を区別して構成

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | UX で「今すぐ」と「きちんと直す」を分けて表示するため。 |
| **活用するインプット** | 上記 3 行動。各行動の性質（今すぐ開ける vs 電池交換 vs 専門家へ）。 |
| **計算・処理** | 1 枚目：今すぐ開ける（機械キー解錠）。2 枚目：恒久対応（電池交換）。3 枚目：不安なら販売店/ロードサービス。action_cards の並びとラベルで表現。 |
| **アウトプット** | 一次解決／恒久対応が分かった action_cards（3 枚）。手順・危険注意の付与へ。 |

---

### プロセス 4：各行動に手順・所要時間・必要物・危険注意・代替案を付与

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | ユーザーが実行できる内容として渡すため。 |
| **活用するインプット** | プロセス3の action_cards。手順・必要物・危険注意のテンプレート（機械キー取り出し方、CR2032、販売店推奨文等）。T2の risk_level に基づく risk_notice。 |
| **計算・処理** | ①機械キー解錠：steps=キーから機械キーを取り出しドアの鍵穴に挿して解錠、duration=約30秒、risk_notice=なし、alternative=開かない場合はロードサービスへ。②電池交換：required_items=CR2032、risk_notice=**部品破損の恐れがあるため、販売店での交換を推奨します。**→ UX ではこの情報を出したうえで、**「販売店で交換する」「自分で交換する」をユーザーに選択させるステップを入れる**。alternative=電池購入先の案内へ。③販売店/ロードサービス：位置共有・症状要約付き。 |
| **アウトプット** | action_cards[]（3 枚、title/steps/duration/required_items/risk_notice/alternative/**guide_id** 付き）。T5 の最終出力の一部。**guide_id** は取扱説明書由来のガイド（`docs/journey/csv_data/` の XML_GUIDE_INTEGRATION_SUMMARY 参照）を参照する。電池交換（A_DOOR_002）では risk_notice に応じた**選択ステップ（販売店／自分で）**を UX で挿入する。 |

**出力例**
- ① action_id: "A_DOOR_001", **guide_id: "GUIDE-001"**（機械キーの取り出し方）, title: "今すぐ開ける：機械キーで解錠", steps: ["キーから機械キーを取り出し、ドアの鍵穴に挿して解錠"], duration: "約30秒", required_items: [], risk_notice: null, alternative: "開かない場合はロードサービスへ"
- ② action_id: "A_DOOR_002", **guide_id: "GUIDE-005"**（電池交換手順）, title: "恒久対応：電池交換", required_items: ["CR2032（ボタン電池）"], risk_notice: "部品破損の恐れがあるため、販売店での交換を推奨します。", alternative: "電池購入先の案内へ"  
  **→ UX：risk_notice 表示後、「販売店で交換する」「自分で交換する」のいずれかをユーザーに選択させる。販売店を選んだ場合は予約・連絡先案内、自分でを選んだ場合は手順（steps）と必要物・注意を表示し、実施後の結果（うまくいった／いかなかった）を確認する。**
- ③ action_id: "A_DOOR_003", **guide_id: "GUIDE-006"**（販売店予約・連絡先）, title: "不安なら：販売店・ロードサービス", steps: ["位置共有・症状要約付きで連絡"]

---

### プロセス 5：escalation_option を必要に応じて付与

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 不安時の出口を明示するため。 |
| **活用するインプット** | 事象 DOOR_NOT_OPEN、action_cards。エスカレーション先マスタ（販売店予約、ロードサービス）。 |
| **計算・処理** | ドアが開かないでは販売店予約・ロードサービスを escalation_option として付与。 |
| **アウトプット** | escalation_option（販売店予約、ロードサービス）。T5 の最終出力として UX に渡す。 |

**出力例**
```
escalation_option: {
  dealer: "販売店予約",
  road_service: "ロードサービス"
}
```

---

**T5 の最終アウトプット（ドアが開かない）**

- action_cards[]（最大 3）：①今すぐ開ける（機械キーで解錠）②恒久対応（電池交換）③不安なら（販売店/ロードサービス）  
- escalation_option：販売店予約、ロードサービス  

---

## T6：結果評価・再探索（ドアが開かない）

**処理の位置づけ**：結果判定と分岐。開いたかどうか、一時解決か恒久対応完了か、未解決なら T4 戻し or T3 戻し or エスカレーションを決める。

---

### プロセス 1：action_result と追加観察から resolved（true/false）を判定

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 解決したかどうかで分岐が変わるため。 |
| **活用するインプット** | ユーザーが答えた action_result（成功／失敗／不明）。実施した action_id（機械キー解錠 or 電池交換 or 販売店等）。追加観察「開きましたか？」の回答。 |
| **計算・処理** | 「開きましたか？」が Yes かつ action_result=成功 → resolved=true。「開きましたか？」が No または action_result=失敗 → resolved=false。不明は false 扱い等、ルールで定義。 |
| **アウトプット** | resolved（true/false）。以降の分岐の入力。 |

---

### プロセス 2：resolved=true の場合（一時解決か／恒久対応完了か、次のステップ誘導）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 一時解決時に次にやることを案内するため。 |
| **活用するインプット** | resolved=true。実施した action_id（機械キー解錠 or 電池交換等）。行動の性質マッピング（機械キー解錠＝一時解決、電池交換完了＝恒久対応の一歩等）。次のステップマスタ（エンジンのかけ方、電池交換ガイド等）。 |
| **計算・処理** | 実施した行動が「機械キーで開けただけ」なら一時解決と判定。next_step=done_with_next_steps、next_steps_guidance に「エンジンのかけ方」「電池交換のガイド」を付与。電池交換まで完了して開くようになった等なら next_step=done。 |
| **アウトプット** | next_step（done / done_with_next_steps）、next_steps_guidance（一時解決時）。 |

**出力例（機械キーで開けた場合）**
```
resolved: true
next_step: "done_with_next_steps"
next_steps_guidance: [
  { id: "engine_start_guide", label: "エンジンのかけ方", type: "guide" },
  { id: "battery_replace_guide", label: "電池交換のガイド", type: "guide" }
]
```

---

### プロセス 3：resolved=false の場合（T4に戻す／T3に戻す／エスカレーション）

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須** |
| **理由** | 未解決時の次の一手を決めるため。 |
| **活用するインプット** | resolved=false。実施した action_id と action_result（例：機械キーで解錠を試したが開かなかった）。試行回数・T5 行動履歴。観察不足かどうかの判定（別のキーで試す等が必要か）。エスカレーションしきい値。 |
| **計算・処理** | **原則**：行動失敗を「新しい証拠」として T4 に渡す。next_step=retry_with_t4、evidence_from_failure に「機械キーで解錠を試したが開かなかった」等を格納。T4 が仮説を更新し（例：ドアロック故障の確率上昇）、T5 が別案（販売店/ロードサービス等）を出す。**観察不足と判断したときのみ** next_step=next_question、T3 用ヒント（例：電波干渉の可能性、場所/他のキーで試す等）を付与。試行が続く or 危険と判断したら next_step=escalate。 |
| **アウトプット** | next_step（retry_with_t4 / next_question / escalate）、evidence_from_failure または next_question。 |

**出力例（T4に戻す場合）**
```
resolved: false
next_step: "retry_with_t4"
evidence_from_failure: {
  action_id: "A_DOOR_001",
  action_result: "failed",
  summary: "機械キーで解錠を試したが開かなかった"
}
```

---

### プロセス 4：エスカレーション時は handoff_payload を生成

| 項目 | 「ドアが開かない」での具体 |
|------|---------------------------|
| **必要性** | **必須**（エスカレーション時） |
| **理由** | エスカレーション時に専門家へ渡す情報をまとめるため。 |
| **活用するインプット** | next_step=escalate。event_id=DOOR_NOT_OPEN。試した T5 の行動一覧（機械キー解錠試行、電池交換試行等）と結果。T3 の観察履歴（ランプは点くか等の回答）。 |
| **計算・処理** | event_id、actions_tried[]（試した手順）、result_summary（開かなかった、ランプは点いた等）をまとめ、販売店・ロードサービスが続きを受け取りやすい最小情報で handoff_payload を生成。 |
| **アウトプット** | handoff_payload。T6 の最終出力の一部。 |

**出力例**
```
handoff_payload: {
  event_id: "DOOR_NOT_OPEN",
  actions_tried: ["機械キーで解錠試行", "電池交換試行"],
  result_summary: "開かなかった。ランプは点かなかった。"
}
```

---

**T6 の最終アウトプット（ドアが開かない）の例**

- **一時解決（機械キーで開けた）**：resolved=true、next_step=done_with_next_steps、next_steps_guidance=[エンジンのかけ方、電池交換のガイド]  
- **未解決・T4 に戻す**：resolved=false、next_step=retry_with_t4、evidence_from_failure={ action_id, action_result: failed, summary }  
  - **A_DOOR_001（機械キーで解錠）失敗**：evidence を T4 に渡し、ドアロック故障等を上げて T5 で「販売店・ロードサービス」等を出す。  
  - **A_DOOR_004（キーをドアハンドルに近づけて再試行）失敗**：ランプはつくが車が反応しない経路。evidence を T4 に渡し、電波干渉を下げ・ドアロック故障／12V低下を上げ、T5 で**ユーザーが試せる選択肢**（「予備のスマートキーで試す」「今すぐ開ける：機械キーで解錠」「販売店・ロードサービス」）を出してから、必要なら専門家へ。
  - **A_DOOR_005（予備のスマートキーで試す）**：予備キーで試した結果、**うまくいった** → 今使っているキー側の不調の可能性。そのキーの電池交換・販売店での点検を案内（done_with_next_steps）。**うまくいかなかった** → 車両側の可能性。evidence を T4 に渡し、T5 で「機械キーで解錠」「販売店・ロードサービス」を提示（retry_with_t4）。  
- **未解決・T3 に戻す（観察不足時）**：resolved=false、next_step=next_question、next_question={ hint: 電波干渉の可能性, suggested_observations: [location, other_key_result] }  
- **エスカレーション**：resolved=false、next_step=escalate、handoff_payload={ event_id, actions_tried, result_summary }  

---

## 参照

- プロセス構造の汎用整理：`T1-T6_Process_Consolidation.md`  
- 事象別の I/O 例：`Thought_Function_Model_T1-T6.md` の「A) ドアが開かない」
- 各プロセスの必要性・スキップ条件：`T1-T6_Process_Necessity_and_Skip.md`
- **T1 プロセス5 状態情報算出**（緊急度・心理リスク・evidence）：`T1_Process5_状態情報算出ルール.md`