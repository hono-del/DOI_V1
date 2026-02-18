---
marp: true
theme: default
paginate: true
size: 16:9
title: Journey Graph CSV データ（共有版）
description: docs/journey/csv_data/README.md をメンバー共有向けに要約
---

# Journey Graph CSV データ  
## メンバー共有用スライド（要点版）

- 対象: `docs/journey/csv_data/README.md`
- 目的: **テーマ別ジャーニー（THEME-XXX）をCSVで定義し、フロー図で確認できる状態にする**

---

## 1. このディレクトリで何をしている？

- **ユーザージャーニー（診断→分岐→案内）** をCSVで定義
- `THEME-XXX_input.txt`（人が書く）→ 自動変換 → CSV追記（機械が使う）
- 生成物の確認は `THEME-XXX_visual_flow.html`

---

## 2. クイックスタート（新規テーマ作成）

1) `THEME-XXX_input.txt` を作る（記号ベース）  
2) 変換を実行

```bash
cd docs/journey/csv_data
py generate_journey_csv.py THEME-XXX_input.txt
```

3) `THEME-XXX_visual_flow.html` をブラウザで確認  

---

## 3. 最低限必要なCSV（テーマが「辿れる」最小セット）

**Theme → Node → Check → Edge → Guide** を辿るために最低限必要：

- `JourneyNode.csv`：ノード（状態）定義
- `CheckCondition.csv`：質問（判定条件）定義
- `Edge.csv`：分岐/遷移定義
- `Guide.csv`：提示するガイド定義
- `NodeIntent.csv`：ノード×意図の付与

---

## 4. データの辿り方（基本）

```
Theme → JourneyNode → CheckCondition → Edge → Guide
```

- **テーマ**を特定（例: `THEME-001`）
- **開始ノード**から進む（ノード→判定→エッジで次へ）
- 最終的に **Guide**（案内）へ到達する

---

## 5. 各CSVの役割（1/2）

### `Theme.csv`（テーマ定義）
- テーマID/名前/説明/緊急度/主要インテントなど

### `JourneyNode.csv`（ノード定義）
- 各状態（異常検知/原因仮説/判定/対応選択…）を定義

### `CheckCondition.csv`（判定条件）
- ユーザーに確認する質問、回答タイプ、選択肢など

---

## 6. 各CSVの役割（2/2）

### `Edge.csv`（分岐/遷移）
- from→to を定義（条件ID/条件値/優先度/遷移先タイプ）

### `Guide.csv`（ガイド定義）
- 最終的に提示する案内（手順/注意/連絡先 等）

### `NodeIntent.csv`（ノード×意図）
- ノードごとの primary/secondary intent（推測の起点）

---

## 7. 意図推測（必要に応じて）

```
JourneyNode → NodeIntent → IntentAction → Guide
```

- `NodeIntent.csv` で「基本の意図」を持たせる
- 文脈（時刻/場所/経験など）で優先度を調整（将来拡張）
- 意図に応じて出す Guide を変える（任意の設計）

---

## 8. 生成・更新されるもの（自動変換）

`generate_journey_csv.py` 実行で主に以下が更新/生成される想定：

- 更新: `JourneyNode.csv`, `CheckCondition.csv`, `Edge.csv`, `Guide.csv`, `NodeIntent.csv`
- 生成: `THEME-XXX_visual_flow.html`

---

## 9. 確認ポイント（フロー図で見る）

`THEME-XXX_visual_flow.html` で確認：

- ノードの接続（分岐）が意図通りか
- 終端（解決/エスカレーション）に到達するか
- 不正なノード参照・表記ゆれがないか

---

## 10. 調整ポイント（CSVを直接直す場面）

自動変換が完璧でない場合に手動で調整：

- フェーズ（phase）名称の適正化
- hypotheses の具体化
- intent の見直し
- edge の priority 調整

---

## 11. 参考ドキュメント

- 詳細: `docs/journey/csv_data/README.md`
- 作り方: `docs/journey/csv_data/HOW_TO_CREATE_FLOW.md`
- THEME-001全体: `docs/journey/csv_data/COMPLETE_GUIDE_SYSTEM.md`

---

## 12. 共有・配布方法（おすすめ）

このファイルは **Marp** でスライド化できます：

- VS Code 拡張: “Marp for VS Code”  
- エクスポート: **PDF / PPTX**（拡張からExport）

ファイル: `docs/journey/csv_data/README_SLIDES.md`

