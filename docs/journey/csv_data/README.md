# Journey Graph CSV データ

## 概要

このディレクトリには、取扱説明書DXシステムのユーザージャーニーを定義するCSVデータが格納されています。

## 🚀 クイックスタート

新しいテーマのフローを作成する手順:

### 1. 入力ファイル作成
`THEME-XXX_input.txt`を記号ベース形式で記述
```
テーマ: 新しい問題
ID: THEME-XXX
緊急度: high

▼ 問題発生
  ? 確認?
    → はい: 次へ
    → いいえ: 別の次へ
```

### 2. 自動変換実行
```bash
py generate_journey_csv.py THEME-XXX_input.txt
```

### 3. 確認
- `THEME-XXX_visual_flow.html`をブラウザで開く
- CSVファイルを確認・調整

**詳細は `HOW_TO_CREATE_FLOW.md` を参照**

---

## ファイル構成

### 1. Theme.csv（テーマ定義）
ユーザーが直面する問題や状況のテーマを定義します。

**カラム:**
- `theme_id`: テーマの一意識別子
- `theme_name`: テーマ名
- `description`: テーマの説明
- `urgency_level`: 緊急度（high/medium/low）
- `primary_intents`: 主要なユーザー意図（パイプ区切り）
- `notes`: 備考

### 2. JourneyNode.csv（ジャーニーノード定義）
ユーザージャーニーの各状態（ノード）を定義します。

**カラム:**
- `node_id`: ノードの一意識別子
- `theme_id`: 所属するテーマID
- `phase`: フェーズ（異常検知/原因仮説/判定/対応選択/対応完了など）
- `state_description`: 状態の説明
- `trigger`: トリガーとなる行動
- `hypotheses`: 仮説（パイプ区切り）
- `confidence_level`: 信頼度（0-1）
- `notes`: 備考

### 3. CheckCondition.csv（判定条件定義）
各ノードでユーザーに確認する質問を定義します。

**カラム:**
- `check_id`: 判定条件の一意識別子
- `node_id`: 対象ノードID
- `question`: ユーザーへの質問文
- `answer_type`: 回答タイプ（boolean/choice/text）
- `answers`: 回答の選択肢（パイプ区切り）
- `supports`: サポートする仮説（パイプ区切り）
- `notes`: 備考

### 4. Edge.csv（分岐定義）
ノード間の遷移（エッジ）を定義します。

**カラム:**
- `edge_id`: エッジの一意識別子
- `from_node_id`: 遷移元ノードID
- `condition`: 判定条件ID（オプション）
- `condition_value`: 条件値（yes/no/choiceの値など）
- `to_type`: 遷移先タイプ（node/guide/alert）
- `to_id`: 遷移先ID
- `priority`: 優先度

### 5. Guide.csv（ガイド定義）
最終的にユーザーに提示するガイドコンテンツを定義します。

**カラム:**
- `guide_id`: ガイドの一意識別子
- `guide_type`: ガイドタイプ（procedure/alert/explanation/contact）
- `title`: ガイドのタイトル
- `estimated_time`: 所要時間
- `risk_level`: リスクレベル（high/medium/low/immediate）
- `notes`: 備考

### 6. IntentOntology.csv（意図オントロジー）
ユーザーの意図を分類する共通定義です。

**カラム:**
- `intent_code`: 意図コード（I1-I6）
- `intent_name`: 意図名
- `description`: 説明
- `default_priority`: デフォルト優先度

**意図の種類:**
- **I1**: 今すぐ使いたい（緊急対応）
- **I2**: 原因を知りたい（理解促進）
- **I3**: 自分で直したい（DIY対応）
- **I4**: 壊したくない・安全優先（リスク回避）
- **I5**: 誰かに頼みたい（専門家依頼）
- **I6**: 後で対応したい（回避策）

### 7. NodeIntent.csv（ノード×意図マッピング）
各ノードにおける主要な意図を定義します。

**カラム:**
- `node_id`: ノードID
- `primary_intent`: 主要意図コード
- `secondary_intent`: 副次意図コード
- `confidence`: 信頼度（0-1）
- `notes`: 備考

### 8. IntentAction.csv（意図別アクション定義）
各意図に対応するアクションを定義します。

**カラム:**
- `intent_code`: 意図コード
- `action_type`: アクションタイプ（guide/alert/contact）
- `action_id`: アクションID（ガイドIDなど）
- `priority`: 優先度
- `notes`: 備考

## データの使い方

### 1. ジャーニーの辿り方

```
Theme → JourneyNode → CheckCondition → Edge → Guide
```

**例: スマートキーでドアが開かない場合**

1. **Theme.csv**: `THEME-001`（ドアが開かない）を特定
2. **JourneyNode.csv**: `NODE-001A`（初期ノード）から開始
3. **CheckCondition.csv**: `CHECK-001A`（インジケーター点灯確認）を実行
4. **Edge.csv**: 回答に応じて次のノードへ遷移
   - `no` → `NODE-001B`（インジケーター点灯しない）
   - `yes` → `NODE-001D`（インジケーター点灯する）
5. **NodeIntent.csv**: 各ノードでユーザー意図を推測
6. **Guide.csv**: 最終的なガイドを提示

### 2. 意図推測の流れ

```
JourneyNode → NodeIntent → IntentAction → Guide
```

**例: NODE-001Bでの意図推測**

1. **NodeIntent.csv**: `NODE-001B`の意図を確認
   - `primary_intent`: I3（自分で直したい）
   - `secondary_intent`: I1（今すぐ使いたい）
2. **L2文脈データ**で優先度を調整
   - 時刻が深夜 → I1の優先度UP
   - 過去に電池交換経験あり → I3の優先度UP
3. **IntentAction.csv**: 意図に応じたアクションを選択
   - I1 → `GUIDE-MECHANICAL-KEY`（機械キーでの開錠）
   - I3 → `GUIDE-KEY-BATTERY`（電池交換手順）
4. **Guide.csv**: ガイドコンテンツを提示

## ジャーニーフロー例

### THEME-001: スマートキーでドアが開かない

```
NODE-001A（初期状態）
    ↓
CHECK-001A: インジケーター点灯確認
    ↓
┌───────┴───────┐
│               │
no              yes
│               │
↓               ↓
NODE-001B       NODE-001D
（点灯しない）   （点灯する）
↓               ↓
CHECK-001B      CHECK-001D
意図確認        意図確認
↓               ↓
┌─────┴─────┐   ┌─────┴─────┐
│           │   │           │
immediate   root immediate   battery
│           │   │           │
↓           ↓   ↓           ↓
NODE-001F   NODE-001E       NODE-001E
機械キー    電池交換        電池交換
↓           ↓               ↓
GUIDE       GUIDE           GUIDE
```

## L2文脈データとの連携

各ノードでL2文脈データを活用して意図推測の精度を向上させます。

**活用する文脈データ:**
- **時刻**: 深夜/早朝 → 即時対応の優先度UP
- **場所**: 遠隔地 → 自力対応の優先度UP
- **天候**: 悪天候 → 安全優先の意図UP
- **ユーザースキルレベル**: 初心者 → 簡単な方法の優先度UP
- **過去の経験**: 類似問題の解決履歴 → 同じ方法の優先度UP

## L3での意図推測ロジック

```python
# 擬似コード
def estimate_intent(node_id, context_data):
    # NodeIntentから基本意図を取得
    node_intent = get_node_intent(node_id)
    primary = node_intent.primary_intent
    secondary = node_intent.secondary_intent
    
    # 文脈データで優先度を調整
    if context_data.time == "night":
        if primary == "I1":
            primary_score += 30
    
    if context_data.location == "remote":
        if primary == "I3":
            primary_score += 20
    
    # 上位2つの意図を返す
    return [primary, secondary]
```

## データ更新のガイドライン

1. **新しいテーマを追加する場合**:
   - `Theme.csv`に新しいテーマを追加
   - 最低3つのノード（異常検知 → 判定 → 対応）を作成

2. **ジャーニーを拡張する場合**:
   - `JourneyNode.csv`に新しいノードを追加
   - `CheckCondition.csv`に判定条件を追加
   - `Edge.csv`でノード間を接続

3. **ガイドコンテンツを追加する場合**:
   - `Guide.csv`に新しいガイドを追加
   - `IntentAction.csv`で意図とガイドを紐付け

## 次のステップ

1. **RAG検索キーの設定**: `theme_id + node_id + intent_code`をRAG検索のキーとして使用
2. **UXログとの連携**: 各ノードでのユーザー行動をログとして記録
3. **継続的改善**: ログデータを分析してジャーニーを最適化

## 関連ドキュメント

- `/docs/journey/journey_graph_量産用csvテンプレート.md`: テンプレートの詳細説明
- `/docs/output/統合_システム要件定義書.md`: システム全体の要件定義
