# THEME-001「スマートキーでドアが開かない」視覚化フロー

## 全体フロー（水平レイアウト）

```mermaid
graph LR
    Start([開始<br/>ドアが開かない]) --> A[初期診断]
    A --> B[原因特定]
    B --> C[対応実施]
    C --> D[検証]
    D --> E[解決 or<br/>エスカレーション]
    
    style A fill:#ffe6e6
    style B fill:#fff4e6
    style C fill:#e6f3ff
    style D fill:#f0e6ff
    style E fill:#e6ffe6
```

---

## 詳細フロー（Phase 1: 初期診断）

```mermaid
graph TD
    Start([ユーザー<br/>ドアが開かない]) --> N001A[NODE-001A<br/>異常検知]
    
    N001A --> C001A{CHECK-001A<br/>インジケーター<br/>点灯?}
    
    C001A -->|No<br/>点灯しない| N001B[NODE-001B<br/>キー電池切れ疑い]
    C001A -->|Yes<br/>点灯する| N001D[NODE-001D<br/>車両側問題疑い]
    
    style Start fill:#f0f0f0
    style N001A fill:#ffcccc
    style C001A fill:#ffffcc
    style N001B fill:#ffe6cc
    style N001D fill:#ffe6cc
```

---

## 詳細フロー（Phase 2A: 電池切れルート）

```mermaid
graph TD
    N001B[NODE-001B<br/>キー電池切れ疑い] --> C001B{CHECK-001B<br/>どうしたい?}
    
    C001B -->|即時<br/>immediate| Route1[機械キールート]
    C001B -->|根本<br/>battery_replace| Route2[電池交換ルート]
    
    Route1 --> N001F[NODE-001F<br/>機械キー使用決定]
    Route2 --> N001E[NODE-001E<br/>電池交換実施]
    
    style N001B fill:#ffe6cc
    style C001B fill:#ffffcc
    style Route1 fill:#cce6ff
    style Route2 fill:#cce6ff
    style N001F fill:#cce6ff
    style N001E fill:#cce6ff
```

---

## 詳細フロー（Phase 2B: 機械キー対応）

```mermaid
graph TD
    N001F[NODE-001F<br/>機械キー使用決定] --> C001E{CHECK-001E<br/>機械キー<br/>持ってる?}
    
    C001E -->|Yes<br/>あり| N001H[NODE-001H<br/>機械キー開錠実施]
    C001E -->|No<br/>なし| N001I[NODE-001I<br/>機械キー未所持]
    
    N001H --> C001F{CHECK-001F<br/>開いた?}
    
    C001F -->|Yes<br/>成功| Success[NODE-001Q<br/>解決]
    C001F -->|No<br/>失敗| Fail[NODE-001J<br/>ドアロック故障]
    
    N001I --> G1[GUIDE<br/>機械キーの場所]
    N001I --> Service[NODE-001P<br/>ロードサービス]
    
    style N001F fill:#cce6ff
    style C001E fill:#ffffcc
    style N001H fill:#cce6ff
    style C001F fill:#ffffcc
    style N001I fill:#ffcccc
    style Success fill:#ccffcc
    style Fail fill:#ffaaaa
    style G1 fill:#e6e6ff
    style Service fill:#ffccaa
```

---

## 詳細フロー（Phase 2C: 電池交換対応）

```mermaid
graph TD
    N001E[NODE-001E<br/>電池交換実施] --> C001G{CHECK-001G<br/>電池交換後<br/>解決した?}
    
    C001G -->|Yes<br/>解決| Success[NODE-001Q<br/>解決]
    C001G -->|No<br/>未解決| N001K[NODE-001K<br/>電池交換でも<br/>未解決]
    
    N001K --> C001H{CHECK-001H<br/>車両電装品<br/>動作する?}
    
    C001H -->|No<br/>動作しない| N001G[NODE-001G<br/>バッテリー上がり]
    C001H -->|Yes<br/>動作する| N001M[NODE-001M<br/>電波干渉診断]
    
    style N001E fill:#cce6ff
    style C001G fill:#ffffcc
    style N001K fill:#ffe6cc
    style C001H fill:#ffffcc
    style N001G fill:#ffe6cc
    style N001M fill:#ffe6cc
    style Success fill:#ccffcc
```

---

## 詳細フロー（Phase 3: 車両側問題ルート）

```mermaid
graph TD
    N001D[NODE-001D<br/>車両側問題疑い] --> C001H2{CHECK-001H2<br/>車両電装品<br/>動作する?}
    
    C001H2 -->|No<br/>動作しない| N001G[NODE-001G<br/>バッテリー上がり]
    C001H2 -->|Yes<br/>動作する| N001M[NODE-001M<br/>電波干渉診断]
    
    style N001D fill:#ffe6cc
    style C001H2 fill:#ffffcc
    style N001G fill:#ffe6cc
    style N001M fill:#ffe6cc
```

---

## 詳細フロー（Phase 4A: 電波干渉診断）

```mermaid
graph TD
    N001M[NODE-001M<br/>電波干渉診断] --> C001I{CHECK-001I<br/>強い電波を発する<br/>施設の近く?}
    
    C001I -->|Yes<br/>近い| N001N[NODE-001N<br/>電波干渉対応]
    C001I -->|No<br/>遠い| N001L[NODE-001L<br/>その他の診断]
    
    N001N --> C001J{CHECK-001J<br/>キーを車体に<br/>近づけて解決?}
    
    C001J -->|Yes<br/>解決| Success[NODE-001Q<br/>解決]
    C001J -->|No<br/>未解決| N001L
    
    style N001M fill:#ffe6cc
    style C001I fill:#ffffcc
    style N001N fill:#cce6ff
    style C001J fill:#ffffcc
    style N001L fill:#ffe6cc
    style Success fill:#ccffcc
```

---

## 詳細フロー（Phase 4B: その他診断）

```mermaid
graph TD
    N001L[NODE-001L<br/>その他の診断] --> C001K{CHECK-001K<br/>代替キーは<br/>ある?}
    
    C001K -->|Yes<br/>あり| N001O[NODE-001O<br/>代替キー使用]
    C001K -->|No<br/>なし| Fail[NODE-001J<br/>ドアロック故障]
    
    N001O --> C001L{CHECK-001L<br/>代替キーで<br/>解決した?}
    
    C001L -->|Yes<br/>解決| N001R[NODE-001R<br/>元のキー故障]
    C001L -->|No<br/>未解決| Fail
    
    style N001L fill:#ffe6cc
    style C001K fill:#ffffcc
    style N001O fill:#cce6ff
    style C001L fill:#ffffcc
    style N001R fill:#ffccaa
    style Fail fill:#ffaaaa
```

---

## 詳細フロー（Phase 5: バッテリー上がり対応）

```mermaid
graph TD
    N001G[NODE-001G<br/>バッテリー上がり] --> C001M{CHECK-001M<br/>ジャンプスタート<br/>できる環境?}
    
    C001M -->|Yes<br/>可能| Guide1[GUIDE<br/>ジャンプスタート手順]
    C001M -->|No<br/>不可| Service[NODE-001P<br/>ロードサービス]
    
    style N001G fill:#ffe6cc
    style C001M fill:#ffffcc
    style Guide1 fill:#e6e6ff
    style Service fill:#ffccaa
```

---

## 詳細フロー（Phase 6: 終端処理）

```mermaid
graph TD
    Success[NODE-001Q<br/>問題解決] --> Guide2[GUIDE<br/>予防策・定期点検]
    
    Fail[NODE-001J<br/>ドアロック故障] --> Service[NODE-001P<br/>ロードサービス]
    
    KeyFail[NODE-001R<br/>元のキー故障] --> Guide3[GUIDE<br/>キー修理・交換]
    
    Service --> Guide4[GUIDE<br/>ロードサービス連絡先]
    
    style Success fill:#ccffcc
    style Fail fill:#ffaaaa
    style KeyFail fill:#ffccaa
    style Service fill:#ffccaa
    style Guide2 fill:#e6e6ff
    style Guide3 fill:#e6e6ff
    style Guide4 fill:#e6e6ff
```

---

## 簡略版フロー（全体俯瞰）

```mermaid
graph LR
    Start([開始]) --> Diag{初期診断<br/>インジケーター}
    
    Diag -->|点灯しない| Battery[電池切れルート]
    Diag -->|点灯する| Vehicle[車両側ルート]
    
    Battery --> Mech[機械キー]
    Battery --> Replace[電池交換]
    
    Mech --> MechOK{開錠OK?}
    Replace --> ReplaceOK{解決?}
    
    MechOK -->|Yes| Solved[解決]
    MechOK -->|No| Escalate[エスカレーション]
    
    ReplaceOK -->|Yes| Solved
    ReplaceOK -->|No| Further[追加診断]
    
    Vehicle --> VehicleDiag[車両診断]
    VehicleDiag --> Further
    
    Further --> Radio[電波干渉?]
    Further --> Alt[代替キー?]
    
    Radio --> Solved
    Radio --> Escalate
    
    Alt --> KeyFail[キー故障]
    Alt --> Escalate
    
    Escalate --> Service[ロードサービス]
    
    style Start fill:#f0f0f0
    style Diag fill:#ffffcc
    style Battery fill:#ffe6cc
    style Vehicle fill:#ffe6cc
    style Solved fill:#ccffcc
    style Escalate fill:#ffaaaa
    style Service fill:#ffccaa
    style KeyFail fill:#ffccaa
```

---

## 色の凡例

| 色 | 意味 |
|:---|:-----|
| 🔴 赤系 (#ffcccc, #ffaaaa) | 問題発生、診断、故障判定 |
| 🟠 オレンジ系 (#ffe6cc) | 原因仮説、診断中 |
| 🟡 黄色系 (#ffffcc) | 判定条件、ユーザー選択 |
| 🔵 青系 (#cce6ff) | 対応実施中 |
| 🟣 紫系 (#e6e6ff) | ガイドコンテンツ |
| 🟢 緑系 (#ccffcc) | 解決、成功 |
| 🟤 茶系 (#ffccaa) | エスカレーション、専門家対応 |

---

## ノード分類

### 📍 判定ノード（菱形）
- CHECK-001A〜M: ユーザーへの質問、状態確認

### 📦 処理ノード（四角）
- NODE-001A〜R: 状態、対応、判定

### 📘 ガイドノード（四角）
- GUIDE-*: 最終的な案内コンテンツ

### 🎯 終端ノード
- NODE-001Q: 解決
- NODE-001P: ロードサービス
- NODE-001J: ドアロック故障
- NODE-001R: キー故障

---

## 使い方

### 1. **全体俯瞰**: 簡略版フローで全体像を把握
### 2. **詳細確認**: Phase別フローで各ルートの詳細を確認
### 3. **実装**: CSVデータと照らし合わせて実装
