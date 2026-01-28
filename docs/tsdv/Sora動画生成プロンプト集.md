# Sora動画生成プロンプト集
# Human Safety Experience OS デモ動画

**作成日**: 2025年1月7日  
**目的**: 各シーンをSoraで生成するためのプロンプト  
**動画尺**: 各15秒  
**構成**: 各シーンに「課題→解決」の対比を含める

---

## 🎬 基本方針

### 動画スタイル
```yaml
全体のトーン:
  - リアリスティック（実写風）
  - プロフェッショナル
  - 清潔感・信頼感
  - トヨタブランドに合う高品質

カメラワーク:
  - スムーズな動き
  - ドラマチックすぎない
  - ドキュメンタリー風

ライティング:
  - 自然光中心
  - 明るく清潔な印象
  - 課題パートは少し暗め、解決パートは明るく
```

### 対比演出
```yaml
課題パート（0-7秒）:
  - やや暗めのトーン
  - 緊張感のある音楽
  - ドライバーの困惑・焦り

解決パート（8-15秒）:
  - 明るいトーン
  - 安心感のある音楽
  - ドライバーの安堵・笑顔
  - UIが美しく表示される
```

---

## 📹 シーン別プロンプト

### 【オープニング】事故のヒヤリハット (15秒)

#### Soraプロンプト

```
A cinematic 15-second scene showing a near-accident scenario followed by hope. 

[0-7 seconds - Problem]:
Interior view of a modern Toyota car dashboard on a rainy highway at dusk. 
Raindrops on windshield, wipers moving. Dashboard warning lights suddenly illuminate 
in amber and red. Close-up of middle-aged male driver's face showing confusion and concern. 
His hands grip the steering wheel tighter. Traffic ahead, headlights reflecting off 
wet road. Tension building. Darker, cooler color grading.

[8-10 seconds - Transition]:
Screen freezes. Everything goes slightly slow-motion.

[11-15 seconds - Solution concept]:
Same scene but brighter, warmer lighting. A clean, modern holographic UI interface 
appears floating above the dashboard, showing clear icons and guidance. 
Driver's expression shifts to relief and confidence. Soft blue and white light 
from the interface illuminates his face. Calm, reassuring atmosphere.

Style: Photorealistic, professional automotive commercial quality, 
smooth camera movement, shallow depth of field, cinematic lighting, 
4K quality, modern and clean aesthetic.
```

---

### 【シーン1】認知の問題：警告灯の意味が分からない (15秒)

#### Soraプロンプト

```
A 15-second realistic scene contrasting confusion with clarity about car warning lights.

[0-7 seconds - Problem]:
Interior car view, daytime suburban driving. Dashboard warning light suddenly turns on 
(brake pad warning symbol glowing orange). Close-up of young female driver's face 
showing confusion - furrowed brow, eyes darting between road and dashboard. 
She glances at a thick paper manual in the passenger seat but can't safely look. 
Her hand reaches uncertainly toward the dashboard. Slightly muted, cooler colors. 
Sense of worry and uncertainty.

[8-15 seconds - Solution]:
Same interior, but now a sleek, modern AR interface smoothly appears on the windshield 
or floating holographic display. Clean, minimalist UI showing:
- Clear icon of the warning light
- Simple text: "Brake pad wear detected"
- "Safe to drive home (12km remaining)"
- Green checkmark and reassuring visuals

Driver's face brightens with relief and understanding. She nods confidently. 
Warmer, brighter lighting. UI elements are elegant with subtle animations - 
blue and white color scheme with soft glows. Professional, premium feeling.

Style: Photorealistic automotive commercial, clean modern design, 
smooth transitions, natural lighting with tech highlights, 4K quality.
```

---

### 【シーン2】判断の問題：家族ドライブ中の警告 (15秒)

#### Soraプロンプト

```
A 15-second emotional family scene showing worry transformed into reassurance.

[0-7 seconds - Problem]:
Interior of family SUV/minivan, sunny suburban road. Father (40s) driving, 
mother in passenger seat, two children (7-10 years) in back seats with car seats. 
Suddenly "beep beep" warning sound. Dashboard shows brake pad warning light. 
Father's face shows immediate concern. Mother turns to him worriedly, asking silently. 
Young child in back: "Daddy, what's wrong?" with worried expression. 
Family's anxiety visible. Slightly tense atmosphere, natural daylight but 
emotional tension in the air.

[8-15 seconds - Solution]:
Beautiful holographic AR display appears in center console area, casting soft blue light. 
Clean, modern interface showing:
- "Brake pad wear detected"
- "✓ Safe to continue home (12km)"
- "Keep speed under 60km/h"
- Friendly, clear guidance with icons

Father's expression shifts to relief - he smiles and glances at family. 
Mother relaxes, smiles back. He says to children "It's okay!" 
Children smile, relieved. Warm, golden hour lighting fills the car. 
Sense of safety and trust restored. UI is premium, elegant, non-intrusive.

Style: Warm family commercial aesthetic, natural lighting, authentic emotions, 
professional automotive quality, shallow depth of field on faces, 4K detail.
```

---

### 【シーン3】行動の問題：Bluetooth接続の誤操作 (15秒)

#### Soraプロンプト

```
A 15-second scene showing frustration with complex UI versus elegant simplicity.

[0-7 seconds - Problem]:
Interior modern car at traffic light stop, daytime. Young businessman (30s) in driver seat, 
smartphone in one hand. He's trying to connect Bluetooth for music. 
Tapping on complex center display touchscreen - multiple nested menus visible 
(Settings > Connections > Bluetooth > Device list...). 
His face shows frustration, finger hovering uncertainly. Traffic light turns green. 
Car horn sounds from behind. He panics, tries to quickly tap "Cancel" but 
accidentally hits "Factory Reset" button. Pop-up appears: "Reset all settings?" 
His eyes widen in shock - "Oh no!" expression. Screen starts loading. 
Stressful moment. Cooler, tense lighting.

[8-15 seconds - Solution]:
Scene resets. Same situation but with new AI system. He glances at display. 
Beautiful, simple voice-activated interface appears - minimal, elegant design. 
Visual of sound wave animation showing voice input. 
Clean text appears: "Would you like to play music?" with simple Yes/No options. 
Large, clear buttons - impossible to mis-tap. 

He smiles, simply says "Yes" (no audio needed, just mouth movement). 
Music visualizer appears elegantly. He relaxes, drives forward smoothly. 
Green light, calm expression. Warm lighting. UI is premium minimalist - 
white, blue accents, soft glows, very Apple-esque clean design.

Style: Modern tech commercial, clean UI design, realistic human reactions, 
smooth transitions, professional lighting, 4K quality, premium feel.
```

---

### 【シーン4】継続の問題：デフロスターの学習定着 (15秒)

#### Soraプロンプト

```
A 15-second time-lapse story showing learning progression over three instances.

[0-2 seconds - Setup]:
Title card fades in on frosty car windshield: "Day 1 - First Time"

[2-6 seconds - First attempt (confused)]:
Interior view, winter morning, breath visible. Completely frosted windshield - 
can barely see outside. Female driver (30s) in winter coat looking confused at 
climate control panel. Multiple buttons and dials. She hesitantly reaches for controls. 
Detailed AR interface appears showing step-by-step:
1. Turn dial to "windshield" icon (highlighted)
2. Temperature to MAX (highlighted)
3. Fan to HIGH (highlighted)
4. A/C ON button (highlighted)
She follows carefully, reading each step. Uncertain expression.

[6-7 seconds - Transition]:
Quick dissolve. Title: "Day 7 - Second Time"

[7-10 seconds - Second attempt (learning)]:
Same car, frosted windshield again. Same driver, now more confident. 
Simplified AR interface appears - just quick bullet points:
"Defrost: Dial ↑ • MAX • HIGH • A/C ON"
She glances briefly, then operates with more confidence. Small smile forming.

[10-11 seconds - Transition]:
Quick dissolve. Title: "Day 30 - Mastered"

[11-15 seconds - Third attempt (mastery)]:
Same car, frosted windshield. She confidently operates controls smoothly without hesitation. 
Minimal UI appears - just a green checkmark "✓ Defrost activated correctly!" 
She smiles confidently, no longer needs to think about it. Frost begins clearing from windshield. 
Warm morning light coming through. Sense of accomplishment and confidence.

Style: Clean time-lapse progression, consistent camera angle, natural winter lighting, 
subtle UI animations, professional quality, warm color grading progression 
from cool/uncertain to warm/confident, 4K detail.
```

---

### 【シーン5】緊急時対応：高速道路パンク (15秒)

#### Soraプロンプト

```
A 15-second urgent scenario showing panic versus calm guidance.

[0-6 seconds - Problem]:
Exterior then interior. Highway driving, 100km/h, clear day. Sudden "BOOM" sound - 
tire blowout (visible from exterior angle). Car jolts. 
Cut to interior: Male driver (45) grips wheel, face shows shock and panic. 
Car vibrating, pulling to one side. His eyes wide, breathing heavily. 
Dangerous situation. Other cars passing fast. Tense, cooler color grading.

[7-15 seconds - Solution]:
Immediately, beautiful AR heads-up display projects on windshield. 
Large, clear, calm interface:
🚨 "TIRE FAILURE DETECTED"
Clear step-by-step appearing sequentially with voice guidance visualization:
"1. ✓ Hazard lights ON (auto-activated)" - check appears
"2. Guide to shoulder →" - AR arrow appears on road showing safe path
"3. Engine OFF" 
"4. ☎ Roadside assistance (tap to call)"

Driver's expression shifts from panic to focused calm. He follows AR guidance arrows 
overlaid on windshield showing exact path to shoulder. Car safely moves to shoulder. 
He exhales in relief. Timer shows "15 seconds - safe stop completed"

Warmer lighting as situation resolves. UI is premium, clear, with gentle blue/white 
glow. Professional emergency guidance aesthetic.

Style: Dramatic but professional, clear action sequence, dynamic camera movement, 
realistic emergency scenario, high-quality AR effects, automotive commercial standard, 4K.
```

---

### 【シーン6】誤操作防止：エコモード vs パワーモード (15秒)

#### Soraプロンプト

```
A 15-second gentle family scene showing AI preventing a mistake.

[0-5 seconds - Near mistake]:
Interior family car, residential street with 30km/h speed limit signs visible. 
Morning, sunny. Young mother (35) driving, elementary school child in back seat. 
She's searching for "Eco Mode" button on center console. 
Her finger moves toward "Power Mode" button by mistake. 
Camera close-up on her finger about to press wrong button.

[6-15 seconds - Prevention & guidance]:
Just before she presses, elegant warning interface smoothly appears on display:
"💡 Just a moment!"
Beautiful, friendly UI (not alarming):
"Power Mode is not recommended for:
• Residential area (30km/h limit)
• Child passenger
• Fuel efficiency"

Then shows helpful suggestion:
"✓ Eco Mode recommended" 
- Button location highlighted with soft glow
- "Smooth acceleration"
- "Better fuel economy" 
- "Quiet operation"

Mother's face lights up with understanding - "Oh!" expression. She smiles, 
presses correct Eco Mode button. Green confirmation appears elegantly. 
Child in back seat looks happy. Mother says "That's helpful!" (visible, not audio needed).

Warm, bright lighting. UI is friendly, premium, non-judgmental. Sense of helpful partnership.

Style: Warm family commercial, soft lighting, authentic emotions, clean modern UI design, 
professional quality, approachable and friendly tone, 4K detail.
```

---

### 【シーン7】3レイヤーシステム：データ統合の可視化 (15秒)

#### Soraプロンプト

```
A 15-second technical visualization showing AI system integration - beautiful and clear.

[0-4 seconds - Data sources]:
Split screen showing three data streams:
Left: Car interior dashboard with various sensors lighting up, data flowing
Center: Weather data, GPS map, traffic conditions, time of day
Right: User profile - skill level indicator, usage history graphs

Futuristic but professional aesthetic. Data streams as flowing particles/light streams.

[4-8 seconds - Integration]:
The three streams converge into center of screen. Beautiful particle effect - 
blue and white light streams merging into a central AI core (abstract geometric form). 
Data synthesizing. Elegant motion graphics. Premium tech aesthetic like Apple or Tesla reveal.

[8-15 seconds - Output to user]:
AI core transforms into beautiful, simple user interface displayed on car windshield AR:
Clean, minimalist guidance:
"🌧️ Rain increasing on highway"
"Priority actions:"
"1. Increase following distance"
"2. Confirm VSC is ON"  
"3. Reduce to 80km/h"

Interface is crystal clear, elegant typography, perfect spacing. 
Soft blue/white color scheme with subtle glows. 

Camera pulls back to show this displayed in modern car interior. 
Driver (neutral, focused) looking at road with confidence. 
Premium, futuristic but realistic aesthetic.

Style: High-end tech product reveal, clean motion graphics, professional 3D visualization, 
premium automotive tech aesthetic (Tesla/Apple level), smooth animations, 4K quality, 
cinematic lighting.
```

---

### 【シーン8】期待効果：改善グラフの可視化 (15秒)

#### Soraプロンプト

```
A 15-second data visualization showing dramatic improvements - elegant and impactful.

[0-3 seconds - Title]:
Clean white background. Title fades in:
"Impact: The Four Layers of Safety"
Professional typography, minimal design.

[3-7 seconds - Layer by layer]:
Four vertical bar charts appear sequentially (smooth animation):

1. "Recognition" - Understanding rate: 35% → 90% (bar grows, turns from red to green)
2. "Judgment" - Decision time: 45s → 22s (bar shrinks, color shift)
3. "Action" - Error rate: 25% → 17% (bar decreases, color improvement)
4. "Learning" - Feature usage: 10% → 60% (bar grows significantly)

Each appears with elegant slide-in animation. Clean, modern infographic style.
Blue to green color gradient for positive change.

[7-11 seconds - Overall impact]:
Charts merge into center, transform into single large stat:
"Overall accident reduction: 5-10%"
Large, impactful typography. Subtle celebration effect (gentle particles, glow).

[11-15 seconds - Human impact]:
Split screen:
Left: Beautiful graph/data visualization
Right: Happy family in safe car, smiling, sunset lighting

Text overlay: "Toward Zero Traffic Accidents"
Toyota partnership suggested (subtle, professional).

Style: Clean corporate presentation, premium infographic design, smooth animations, 
professional color scheme (blue, white, green for growth), high-quality motion graphics, 
4K detail, Apple Keynote aesthetic quality.
```

---

### 【エンディング】未来のビジョン (15秒)

#### Soraプロンプト

```
A 15-second inspiring vision of the future - emotional and aspirational.

[0-5 seconds - Montage of solved problems]:
Quick cuts (1 second each):
1. Family safely arriving home, smiling
2. Driver confidently using features
3. Clear, helpful UI interface
4. Learning/growth visualization
5. Multiple diverse drivers, all confident and safe

Each shot warm, optimistic, golden hour lighting.

[5-10 seconds - Main message]:
Camera moves through beautiful abstract data/light space (similar to driving through 
tunnel of light/information). Elegant, sci-fi but realistic.

Text appears in clean typography:
"Human Safety Experience OS"
"We translate SDV into human-safe experience"

Particles of information flowing around text. Premium, futuristic aesthetic.

[10-15 seconds - Call to action]:
Fade to modern office/showroom setting. 
Professional handshake between Toyota executive and partner company representative.
Holographic display between them showing system visualization.

Final text:
"Start with 3-month PoC"
"Contact: [info]"
Company logo appears elegantly.

Fade to white.

Style: Inspirational tech commercial, warm and human despite technology, 
premium cinematic quality, emotional resonance, professional business aesthetic, 
subtle sci-fi elements grounded in realism, 4K quality, 
similar to Apple or Tesla vision videos.
```

---

## 🎨 共通ビジュアル要素

### UIデザインの統一

```yaml
全シーン共通のUI要素:
  色:
    - プライマリ: #0066CC (安全ブルー)
    - セカンダリ: #FFFFFF (クリーンホワイト)
    - アクセント: #00AA44 (成功グリーン)
    - 警告: #FF6B00 (注意オレンジ)
  
  フォント:
    - Sans-serif, モダン, 読みやすい
    - 階層明確（見出し・本文・キャプション）
  
  アニメーション:
    - スムーズ (ease-in-out)
    - 派手すぎない
    - 0.3-0.5秒のトランジション
  
  グラフィック:
    - ミニマリスト
    - アイコン使用
    - 視覚的階層明確
```

### カメラワーク

```yaml
カメラムーブメント:
  - スムーズなパン/チルト
  - 自然なフォーカス移動
  - ドラマチックすぎない
  - ドキュメンタリー＋商品CM の中間

アングル:
  - ドライバー視点多用
  - ダッシュボード/UI のクローズアップ
  - 時々外観ショット
  - 家族の表情を捉える
```

---

## 📝 Sora使用時の注意点

### プロンプトの工夫

```yaml
効果的なプロンプト構成:
  1. 時間指定: [0-7 seconds], [8-15 seconds]
  2. カメラアングル明示: Interior view, Close-up, etc.
  3. 照明指定: Natural daylight, Warm lighting, etc.
  4. 感情表現: Worried expression, Relief, Confident, etc.
  5. UI詳細: Clean interface, Holographic display, etc.
  6. スタイル指定: Photorealistic, Commercial quality, etc.

重要なキーワード:
  - "Photorealistic" (実写風)
  - "Automotive commercial quality" (自動車CM品質)
  - "Clean, modern UI" (クリーンでモダンなUI)
  - "Smooth camera movement" (滑らかなカメラ)
  - "4K quality" (4K品質)
  - "Cinematic lighting" (映画的照明)
```

### 生成後の編集

```yaml
Soraで生成後に必要な編集:
  1. UI要素の追加:
     - After Effectsで精密なUI追加
     - テキスト・アイコンのアニメーション
  
  2. 音声:
     - ナレーション追加
     - BGM
     - 効果音（警告音、確認音）
  
  3. カラーグレーディング:
     - 課題パート: やや暗め、クール
     - 解決パート: 明るめ、ウォーム
  
  4. トランジション:
     - シーン間の滑らかな切り替え
     - フェード、ディゾルブ
  
  5. テロップ:
     - 統計データ
     - キーメッセージ
```

---

## 🎬 制作ワークフロー

### Step 1: Soraで基礎映像生成 (1-2週間)

```yaml
手順:
  1. 各シーンのプロンプト最終確認
  2. Soraで生成（複数バリエーション）
  3. ベストテイク選定
  4. 必要に応じて再生成
```

### Step 2: 映像編集 (1-2週間)

```yaml
手順:
  1. Premiere Proでタイムライン構築
  2. After EffectsでUI要素追加
  3. カラーグレーディング
  4. トランジション追加
```

### Step 3: 音声・仕上げ (1週間)

```yaml
手順:
  1. ナレーション収録・編集
  2. BGM配置
  3. 効果音追加
  4. 最終ミックス
  5. 書き出し
```

---

## 💰 コスト試算（Sora使用の場合）

### Soraの料金（想定）

```yaml
Sora利用料:
  - 15秒動画 × 8シーン = 8本
  - 各シーン3バリエーション生成 = 24本
  - 想定料金: $50-100/本（仮定）
  - 合計: $1,200-2,400

追加編集費用:
  - UI制作・追加: 40万円
  - ナレーション: 15万円
  - 音楽・効果音: 10万円
  - 最終編集: 20万円
  
総額: 約100-120万円（Sora使用の場合）

比較:
  完全CG制作: 200-300万円
  実写撮影: 150-250万円
  Sora使用: 100-120万円 ✓ 最もコスト効率的
```

---

## 📋 チェックリスト

### 生成前確認
- [ ] 全プロンプトの日本語→英語翻訳確認
- [ ] 時間配分の最終確認（各15秒）
- [ ] UIデザインの統一性確認
- [ ] トヨタブランドガイドライン確認

### 生成時
- [ ] 各シーン3バリエーション生成
- [ ] 品質チェック
- [ ] ベストテイク選定
- [ ] 必要に応じて再生成

### 編集時
- [ ] UI要素の追加完了
- [ ] カラーグレーディング完了
- [ ] トランジション追加完了
- [ ] ナレーション同期完了

### 最終確認
- [ ] 全体の流れ確認
- [ ] メッセージの一貫性確認
- [ ] 技術的品質確認
- [ ] トヨタ様へのプレビュー

---

**作成者**: DOI 2512 プロジェクトチーム  
**関連資料**: 
- `デモ動画企画書_Human_Safety_Experience_OS.md`
- `トヨタ向け提案書_SDV戦略整合型.md`



