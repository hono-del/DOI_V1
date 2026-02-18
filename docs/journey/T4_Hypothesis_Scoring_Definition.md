# T4：仮説評価・順位付け（Scoring / Bayesian Update）

## T4の定義（採用版）

**T4の役割は、  
原因候補（T2の出力）と観察結果（T3の回答）に基づき、  
各原因の確信度を更新・順位付けし、  
「さらに観察するか／対処に進むか／エスカレーションするか」の状態を決めること。**

---

## 1. T4の目的

T4はユーザーに原因を断定して伝える工程ではありません。  
観察が入るたびに **原因の確率を更新** し、  
次の判断（T3へ戻る／T5へ進む／エスカレーション）の根拠を数値で持つ **「仮説の評価」** を担います。

- スコアリング：事前確率 × 条件一致などで確信度を算出
- しきい値判定：確信度が十分なら READY_FOR_ACTION、危険なら ESCALATE
- UXには基本出さない（裏側）。T5が status に応じて出し分ける

---

## 2. T4 Input（入力）

T4が受け取るのは、候補リストと観察結果です。

### 2.1 原因候補（T2出力）
- cause_candidates[]：原因ID、必要観察、危険度、action_group 等

### 2.2 観察結果（T3の回答）
- question_id と answer（Yes/No、選択肢、数値など）
- 複数ラウンドの場合は、これまでの観察履歴

### 2.3 追加ログ（あれば）
- 失敗回数、環境、再現性
- 走行中／停止中など、緊急度に効く文脈

---

## 3. T4 Process（処理）

T4の処理は「確率更新と状態判定」です。

1. 観察結果を expected_split（T3の出力）と照合し、各原因の条件一致度を算出
2. 事前確率（または前ラウンドの確率）と組み合わせて事後確率を更新
3. 確信度で順位付けし、ranked_causes[] を生成
4. しきい値と危険度に応じて status を決定：
   - MORE_OBSERVATION：まだ観察を続ける
   - READY_FOR_ACTION：対処（T5）へ進む
   - ESCALATE：原因特定より安全を優先し、専門家へ

---

## 4. T4 Output（出力）

T4は順位付き仮説と次のステップ方針を出力します。

### 4.1 基本出力項目

- ranked_causes[]：原因ID、確信度、根拠（どの観察でどう変わったか）
- status：MORE_OBSERVATION / READY_FOR_ACTION / ESCALATE
- （必要なら）next_observation_hint：T3で次に聞くときのヒント

### 4.2 出力例

```json
{
  "ranked_causes": [
    {
      "cause_id": "KEY_BATTERY_EMPTY",
      "confidence": 0.72,
      "evidence": ["key_indicator_light=no"]
    },
    {
      "cause_id": "KEY_FAULT",
      "confidence": 0.15,
      "evidence": ["key_indicator_light=no"]
    },
    {
      "cause_id": "OTHER",
      "confidence": 0.13,
      "evidence": []
    }
  ],
  "status": "READY_FOR_ACTION"
}
```

---

## 5. T4でやらないこと

- ユーザーへの断定表現（「原因は〇〇です」はT5側の表現責任）
- 観察質問の選定（T3の役割）
- 行動選択肢の提示（T5の役割）
- 結果の評価（T6の役割）

T4は **仮説の数値化と状態決定** であり、表には出しません。

---

## 6. 一文サマリ

**T4とは、  
観察結果に基づき原因の確信度を更新・順位付けし、  
次の一手（観察継続／対処／エスカレーション）を決めるための仮説評価である。**
