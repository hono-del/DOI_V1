# T2：原因候補列挙（Candidate Generation）

## T2の定義（採用版）

**T2の役割は、  
事象（T1の出力）と車両・文脈情報に基づき、  
あり得る原因を漏れなく列挙し、  
T3（観察点選定）とT4（仮説評価）が使える形で渡すこと。**

---

## 1. T2の目的

T2は原因を1つに絞る工程ではありません。  
**「あり得る原因を全部出す」** ことで、  
その後の観察設計（T3）と確率更新（T4）の土台を用意します。

- UXには基本出さない（AI内部構造）
- 事象・車種・仕様でフィルタし、存在しない原因は落とす
- 各候補に「必要観察・危険度・対処群」を付与し、T3/T4で利用可能にする

---

## 2. T2 Input（入力）

T2が受け取るのは、事象と車両・履歴のメタ情報です。

### 2.1 事象情報（T1出力）
- event_id：事象テーマID
- subtype（あれば）：警告灯の種類など、事象の細分類

### 2.2 車両・仕様
- 車種／年式／グレード／地域仕様
- 装備の有無（該当する故障が存在するか）

### 2.3 過去履歴（あれば）
- 直近の故障・交換・利用状況
- 再発・関連事象の有無

---

## 3. T2 Process（処理）

T2の処理は「原因候補の列挙と整理」です。

1. 知識ベース検索（マニュアル、FAQ、整備要領、統計）で事象に紐づく原因を取得
2. 車種・装備でフィルタ（その車に存在しない原因を落とす）
3. 各候補にメタ情報を付与：原因ID、説明、必要観察、危険度、対処群
4. リストをT3・T4が参照できる形式で出力

---

## 4. T2 Output（出力）

T2は原因候補のリストとメタ情報を出力します。

### 4.1 基本出力項目

- cause_candidates[]：原因候補の配列
  - cause_id：原因ID
  - description：説明（内部用）
  - required_observations：この原因を判定するのに有効な観察（T3の候補）
  - risk_level：危険度（low / medium / high）
  - action_group：対処のグループ（T5で参照）

### 4.2 出力例

```json
{
  "cause_candidates": [
    {
      "cause_id": "KEY_BATTERY_EMPTY",
      "description": "キー電池切れ",
      "required_observations": ["key_indicator_light"],
      "risk_level": "low",
      "action_group": "battery_replace"
    },
    {
      "cause_id": "RADIO_INTERFERENCE",
      "description": "電波干渉",
      "required_observations": ["key_indicator_light", "location"],
      "risk_level": "low",
      "action_group": "retry_or_relocate"
    },
    {
      "cause_id": "LOCK_ACTUATOR_FAULT",
      "description": "ドアロック故障",
      "required_observations": ["other_key_result"],
      "risk_level": "medium",
      "action_group": "dealer"
    }
  ]
}
```

---

## 5. T2でやらないこと

- 原因の順位付け・確率計算（T4の役割）
- ユーザーへの説明文の生成（T5で必要に応じて）
- 観察の選定（T3の役割）
- 1つに絞り込むこと

T2は **候補の列挙** であり、評価はT4に任せます。

---

## 6. 一文サマリ

**T2とは、  
事象にあり得る原因を漏れなく列挙し、  
T3・T4が使える形で渡すための原因候補生成である。**
