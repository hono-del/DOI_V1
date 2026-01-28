# マルチモーダル予測配信エージェント設計書

**バージョン:** 1.0  
**作成日:** 2025年11月12日  
**目的:** ユーザーの行動を予測し、最適なタイミング・チャネルで情報を先回りして配信するエージェントシステムの設計

---

## 📋 目次

1. [概要](#概要)
2. [システムアーキテクチャ](#システムアーキテクチャ)
3. [エージェント詳細設計](#エージェント詳細設計)
4. [ユースケース実装例](#ユースケース実装例)
5. [技術仕様](#技術仕様)
6. [開発計画](#開発計画)

---

## 概要

### 目的
ユーザーの**次の行動を予測**し、その行動に**最適なデバイス・インターフェース**で**先回りして情報配信**するマルチモーダルエージェントシステムを構築する。

### 例：パンク対応シナリオ

```
状況1: 運転中にパンク発生
├─ 検知: タイヤ空気圧センサー異常値
├─ 予測: ユーザーは車内にいる → 次に安全な場所に停車する
└─ 配信: 🚗 車載ディスプレイ + 音声
    └─ 「右前タイヤの空気圧が低下しています。安全な場所に停車してください」

状況2: 車を停車（ギアP、サイドブレーキON）
├─ 検知: 車両停止、ドア未開
├─ 予測: ユーザーは対処方法を確認したい → 次に車外に出る
└─ 配信: 🚗 車載ディスプレイ（詳細説明）
    └─ 「パンク応急修理キットで対応できます。トランクから取り出してください」
    └─ [動画] 修理キットの使い方（30秒）

状況3: ドア開閉検知
├─ 検知: 運転席ドア開→閉
├─ 予測: ユーザーは車外に移動した → 次にトランクを開ける
└─ 配信: 📱 スマホ（位置情報付き）
    └─ 「トランクを開けて、修理キットを取り出してください」
    └─ [AR] トランク内の修理キット位置を表示

状況4: トランク開閉検知
├─ 検知: トランク開→閉（5秒後）
├─ 予測: ユーザーは修理キットを持っている → 次にタイヤに近づく
└─ 配信: 📱 スマホ（ハンズフリー音声）
    └─ 「右前タイヤに近づいてください。音声で手順を案内します」

状況5: GPS位置変化（車両→タイヤ付近）
├─ 検知: スマホGPS移動、車両から2m
├─ 予測: ユーザーはタイヤの前にいる → 次に修理作業開始
└─ 配信: 📱 スマホ（音声ステップガイド + AR）
    └─ 「ステップ1: バルブキャップを外してください」
    └─ [AR] バルブ位置を画面上で強調表示

状況6: 作業完了検知
├─ 検知: タイヤ空気圧回復、10分経過
├─ 予測: ユーザーは片付けたい → 次に車に戻る
└─ 配信: 📱 スマホ（完了通知）
    └─ 「応急修理完了！修理キットをトランクに戻して、最寄りのディーラーへ」
    └─ [地図] 最寄りディーラーの位置と営業時間
```

### 核心的な機能

1. **行動予測**: 次にユーザーが何をするかを予測
2. **チャネル選択**: その行動に最適なデバイスを選択
3. **先回り配信**: ユーザーが必要とする前に情報を届ける
4. **シームレス連携**: デバイス間で文脈を引き継ぐ

---

## システムアーキテクチャ

### 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                    センサー・入力層                              │
├─────────────────────────────────────────────────────────────────┤
│ 車両センサー │ スマホセンサー │ 外部API │ ユーザー操作ログ    │
│ (CAN/TPMS)   │ (GPS/加速度)   │(天気等) │ (タップ/音声)       │
└────┬─────────┴────┬──────────┴────┬────┴────┬───────────────┘
     │              │               │         │
     v              v               v         v
┌─────────────────────────────────────────────────────────────────┐
│              イベント統合・状態管理層                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ イベント統合     │  │ 状態トラッカー   │  │ 文脈記憶      │ │
│  │ エージェント     │  │ (State Machine)  │  │ (Context DB)  │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
└────┬────────────────────┬────────────────────┬─────────────────┘
     │                    │                    │
     v                    v                    v
┌─────────────────────────────────────────────────────────────────┐
│              行動予測・意図理解層                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ 行動予測         │  │ 意図推定         │  │ シナリオ      │ │
│  │ エージェント     │  │ エージェント     │  │ マッチング    │ │
│  │ (Next Action)    │  │ (Intent)         │  │ エンジン      │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
└────┬────────────────────┬────────────────────┬─────────────────┘
     │                    │                    │
     v                    v                    v
┌─────────────────────────────────────────────────────────────────┐
│              チャネル選択・コンテンツ生成層                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ チャネル選択     │  │ コンテンツ生成   │  │ タイミング    │ │
│  │ エージェント     │  │ エージェント     │  │ 最適化        │ │
│  │ (Best Channel)   │  │ (RAG + LLM)      │  │ エンジン      │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
└────┬────────────────────┬────────────────────┬─────────────────┘
     │                    │                    │
     v                    v                    v
┌─────────────────────────────────────────────────────────────────┐
│              マルチモーダル配信層                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 車載HMI  │  │ スマホ   │  │ 音声     │  │ ウェアラブル│    │
│  │ (画面+音)│  │ (AR/動画)│  │ (TTS)    │  │ (振動)    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└────┬─────────────┬─────────────┬─────────────┬────────────────┘
     │             │             │             │
     v             v             v             v
┌─────────────────────────────────────────────────────────────────┐
│              フィードバック・学習層                              │
├─────────────────────────────────────────────────────────────────┤
│  ユーザー反応分析 │ 予測精度評価 │ チャネル効果測定 │ モデル更新│
└─────────────────────────────────────────────────────────────────┘
```

---

## エージェント詳細設計

### エージェント1: 行動予測エージェント

**役割:** ユーザーの次の行動を予測する

```python
class BehaviorPredictionAgent:
    """行動予測エージェント"""
    
    def __init__(self):
        self.llm = OpenAI(model="gpt-4")
        self.behavior_models = {
            'sequence_predictor': SequencePredictor(),  # LSTM/Transformer
            'pattern_matcher': PatternMatcher(),        # ルールベース
            'context_analyzer': ContextAnalyzer()       # LLMベース
        }
        self.scenario_db = ScenarioDB()
    
    async def predict_next_action(self, current_state, context_history):
        """次の行動を予測"""
        
        # 1. 現在の状況を分析
        situation_analysis = await self.analyze_situation(current_state)
        
        # 2. 類似シナリオを検索
        similar_scenarios = self.scenario_db.find_similar(
            situation=situation_analysis,
            limit=5
        )
        
        # 3. 複数モデルで予測
        predictions = await asyncio.gather(
            self.predict_by_sequence(current_state, context_history),
            self.predict_by_pattern(current_state, similar_scenarios),
            self.predict_by_llm(current_state, context_history)
        )
        
        # 4. アンサンブル予測
        final_prediction = self.ensemble_predictions(predictions)
        
        return {
            'next_action': final_prediction.action,
            'confidence': final_prediction.confidence,
            'estimated_timing': final_prediction.timing,
            'alternative_actions': final_prediction.alternatives,
            'reasoning': final_prediction.reasoning
        }
    
    async def predict_by_llm(self, current_state, context_history):
        """LLMによる予測"""
        
        prompt = f"""
        ## 現在の状況
        {self.format_current_state(current_state)}
        
        ## これまでの経緯
        {self.format_context_history(context_history)}
        
        ## タスク
        ユーザーが次に取る行動を予測してください。
        
        ## 出力形式
        {{
            "next_action": "具体的な行動",
            "confidence": 0.0-1.0,
            "estimated_timing": "秒数",
            "reasoning": "予測の根拠"
        }}
        """
        
        response = await self.llm.agenerate(prompt)
        return json.loads(response.text)
    
    async def analyze_situation(self, current_state):
        """状況分析"""
        
        # パンク例
        if current_state.vehicle.tire_pressure_warning:
            if current_state.vehicle.speed > 0:
                return {
                    'situation_type': 'emergency_driving',
                    'urgency': 'high',
                    'user_location': 'in_vehicle',
                    'expected_sequence': [
                        'find_safe_place',
                        'stop_vehicle',
                        'check_information',
                        'exit_vehicle',
                        'open_trunk',
                        'get_repair_kit',
                        'approach_tire',
                        'perform_repair'
                    ]
                }
            elif current_state.vehicle.speed == 0 and current_state.vehicle.door_closed:
                return {
                    'situation_type': 'emergency_stopped',
                    'urgency': 'high',
                    'user_location': 'in_vehicle_stopped',
                    'expected_sequence': [
                        'check_information',
                        'exit_vehicle',
                        'open_trunk',
                        # ...
                    ]
                }
        
        return situation_analysis
```

---

### エージェント2: チャネル選択エージェント

**役割:** 予測された行動に最適なデバイス・インターフェースを選択

```python
class ChannelSelectionAgent:
    """チャネル選択エージェント"""
    
    def __init__(self):
        self.channel_rules = ChannelRuleEngine()
        self.user_preferences = UserPreferenceDB()
        self.device_availability = DeviceAvailabilityTracker()
    
    async def select_best_channel(self, predicted_action, current_state, user_profile):
        """最適チャネル選択"""
        
        # 1. 利用可能デバイスの確認
        available_devices = await self.device_availability.get_available(
            user_id=user_profile.user_id
        )
        
        # 2. 各チャネルのスコアリング
        channel_scores = {}
        for device in available_devices:
            score = await self.calculate_channel_score(
                device=device,
                predicted_action=predicted_action,
                current_state=current_state,
                user_profile=user_profile
            )
            channel_scores[device] = score
        
        # 3. 最適チャネル選択
        best_channel = max(channel_scores.items(), key=lambda x: x[1])
        
        return {
            'primary_channel': best_channel[0],
            'fallback_channels': self.get_fallback_channels(channel_scores),
            'modality': self.determine_modality(best_channel[0], predicted_action),
            'reasoning': self.explain_selection(best_channel, channel_scores)
        }
    
    async def calculate_channel_score(self, device, predicted_action, current_state, user_profile):
        """チャネルスコア計算"""
        
        score = 0.0
        
        # 1. ユーザーの状態適合性 (40%)
        state_fitness = self.evaluate_state_fitness(device, current_state)
        score += state_fitness * 0.4
        
        # 2. 行動適合性 (30%)
        action_fitness = self.evaluate_action_fitness(device, predicted_action)
        score += action_fitness * 0.3
        
        # 3. コンテンツ適合性 (20%)
        content_fitness = self.evaluate_content_fitness(device, predicted_action.content_type)
        score += content_fitness * 0.2
        
        # 4. ユーザー嗜好 (10%)
        user_preference = self.get_user_preference(user_profile, device)
        score += user_preference * 0.1
        
        return score
    
    def evaluate_state_fitness(self, device, current_state):
        """状態適合性評価"""
        
        # 運転中
        if current_state.user_state == 'driving':
            if device.type == 'in_car_display':
                return 0.9  # 車載ディスプレイが最適
            elif device.type == 'voice':
                return 0.8  # 音声も良い
            elif device.type == 'smartphone':
                return 0.1  # スマホは危険
        
        # 車外（徒歩）
        elif current_state.user_state == 'walking_near_vehicle':
            if device.type == 'smartphone':
                return 0.9  # スマホが最適
            elif device.type == 'voice':
                return 0.7  # 音声も良い（ハンズフリー）
            elif device.type == 'in_car_display':
                return 0.2  # 車載は見えない
        
        # 車外（作業中）
        elif current_state.user_state == 'working_on_vehicle':
            if device.type == 'voice':
                return 0.9  # 音声が最適（両手が塞がっている）
            elif device.type == 'smartphone' and device.has_ar:
                return 0.8  # AR対応スマホも良い
            elif device.type == 'wearable':
                return 0.7  # ウェアラブルも良い
        
        return 0.5
    
    def evaluate_action_fitness(self, device, predicted_action):
        """行動適合性評価"""
        
        action_device_map = {
            'find_safe_place': {
                'in_car_display': 0.9,  # ナビ表示
                'voice': 0.8,
                'smartphone': 0.3
            },
            'check_information': {
                'in_car_display': 0.9,  # 詳細表示可能
                'smartphone': 0.7,
                'voice': 0.5
            },
            'exit_vehicle': {
                'smartphone': 0.9,  # 持ち出せる
                'voice': 0.6,
                'in_car_display': 0.2  # 見えなくなる
            },
            'open_trunk': {
                'smartphone': 0.9,  # 位置案内
                'voice': 0.7,
                'wearable': 0.6
            },
            'approach_tire': {
                'smartphone': 0.9,  # GPS誘導
                'voice': 0.8,
                'wearable': 0.5
            },
            'perform_repair': {
                'voice': 0.9,        # ハンズフリー
                'smartphone': 0.8,   # AR表示
                'wearable': 0.6
            }
        }
        
        return action_device_map.get(predicted_action.type, {}).get(device.type, 0.5)
    
    def determine_modality(self, device, predicted_action):
        """モダリティ決定"""
        
        # デバイスと行動に基づいてモダリティを決定
        modality_map = {
            ('in_car_display', 'find_safe_place'): ['visual', 'audio', 'navigation'],
            ('in_car_display', 'check_information'): ['visual', 'audio', 'video'],
            ('smartphone', 'open_trunk'): ['visual', 'audio', 'haptic'],
            ('smartphone', 'approach_tire'): ['visual', 'audio', 'ar'],
            ('smartphone', 'perform_repair'): ['ar', 'audio', 'video'],
            ('voice', 'perform_repair'): ['audio', 'step_by_step'],
            ('wearable', 'perform_repair'): ['haptic', 'audio']
        }
        
        key = (device.type, predicted_action.type)
        return modality_map.get(key, ['visual', 'audio'])
```

---

### エージェント3: タイミング最適化エージェント

**役割:** 情報配信の最適なタイミングを決定

```python
class TimingOptimizationAgent:
    """タイミング最適化エージェント"""
    
    def __init__(self):
        self.timing_predictor = TimingPredictionModel()
        self.cognitive_load_estimator = CognitiveLoadEstimator()
    
    async def optimize_delivery_timing(self, predicted_action, channel, content):
        """配信タイミング最適化"""
        
        # 1. 行動発生タイミング予測
        action_timing = await self.predict_action_timing(predicted_action)
        
        # 2. 認知負荷評価
        cognitive_load = await self.cognitive_load_estimator.estimate(
            current_state=predicted_action.current_state
        )
        
        # 3. 先回り時間の計算
        lead_time = self.calculate_optimal_lead_time(
            action_timing=action_timing,
            content_complexity=content.complexity,
            cognitive_load=cognitive_load,
            channel=channel
        )
        
        # 4. 配信タイミング決定
        delivery_timing = {
            'immediate': lead_time == 0,
            'delay_seconds': lead_time,
            'delivery_at': datetime.now() + timedelta(seconds=lead_time),
            'confidence': action_timing.confidence,
            'reasoning': self.explain_timing(lead_time, action_timing, cognitive_load)
        }
        
        return delivery_timing
    
    def calculate_optimal_lead_time(self, action_timing, content_complexity, cognitive_load, channel):
        """最適先回り時間の計算"""
        
        # 基本先回り時間
        base_lead_time = action_timing.estimated_seconds * 0.7  # 行動の70%前
        
        # コンテンツ複雑度による調整
        if content_complexity == 'high':
            base_lead_time += 10  # 10秒早める（理解に時間が必要）
        elif content_complexity == 'low':
            base_lead_time += 2   # 2秒早める
        
        # 認知負荷による調整
        if cognitive_load > 0.7:  # 高負荷
            base_lead_time += 5   # さらに早める（処理に時間がかかる）
        
        # チャネルによる調整
        if channel.type == 'voice':
            base_lead_time += 3   # 音声は聞く時間が必要
        elif channel.type == 'ar':
            base_lead_time += 5   # ARは準備時間が必要
        
        # 緊急度による調整
        if action_timing.urgency == 'high':
            base_lead_time = min(base_lead_time, 5)  # 緊急時は最大5秒前
        
        return max(0, base_lead_time)  # 負の値は0に
```

---

### エージェント4: コンテンツ生成エージェント

**役割:** チャネルとモダリティに最適化されたコンテンツを生成

```python
class ContentGenerationAgent:
    """コンテンツ生成エージェント"""
    
    def __init__(self):
        self.llm = OpenAI(model="gpt-4")
        self.rag_system = RAGSystem()
        self.template_engine = TemplateEngine()
        self.ar_generator = ARContentGenerator()
        self.tts_engine = TTSEngine()
    
    async def generate_content(self, predicted_action, channel, modality, context):
        """コンテンツ生成"""
        
        # 1. RAGで関連情報を取得
        relevant_info = await self.rag_system.retrieve(
            query=predicted_action.description,
            context=context
        )
        
        # 2. モダリティごとにコンテンツ生成
        content = {}
        
        if 'visual' in modality:
            content['visual'] = await self.generate_visual_content(
                action=predicted_action,
                info=relevant_info,
                channel=channel
            )
        
        if 'audio' in modality or 'voice' in modality:
            content['audio'] = await self.generate_audio_content(
                action=predicted_action,
                info=relevant_info,
                channel=channel
            )
        
        if 'ar' in modality:
            content['ar'] = await self.generate_ar_content(
                action=predicted_action,
                info=relevant_info,
                context=context
            )
        
        if 'video' in modality:
            content['video'] = await self.select_video_content(
                action=predicted_action,
                info=relevant_info
            )
        
        if 'haptic' in modality:
            content['haptic'] = await self.generate_haptic_pattern(
                action=predicted_action
            )
        
        return content
    
    async def generate_audio_content(self, action, info, channel):
        """音声コンテンツ生成"""
        
        # 行動に応じた音声スクリプト生成
        prompt = f"""
        ## 状況
        ユーザーは次の行動を取ろうとしています: {action.description}
        
        ## 提供すべき情報
        {info.summary}
        
        ## 制約
        - {channel.type}で配信
        - 簡潔に（15秒以内）
        - 具体的な指示を含める
        - 親しみやすいトーン
        
        ## タスク
        ユーザーに伝える音声スクリプトを生成してください。
        """
        
        script = await self.llm.agenerate(prompt)
        
        # 音声合成
        audio_file = await self.tts_engine.synthesize(
            text=script.text,
            voice='friendly_female',
            speed=1.0
        )
        
        return {
            'script': script.text,
            'audio_file': audio_file,
            'duration_seconds': audio_file.duration
        }
    
    async def generate_ar_content(self, action, info, context):
        """ARコンテンツ生成"""
        
        # パンク修理の例
        if action.type == 'perform_repair':
            # タイヤのバルブ位置を強調表示するAR
            ar_content = await self.ar_generator.create_overlay(
                target_object='tire_valve',
                vehicle_model=context.vehicle.model,
                annotations=[
                    {
                        'type': 'arrow',
                        'target': 'valve_position',
                        'label': 'ここにノズルを接続',
                        'color': 'red'
                    },
                    {
                        'type': 'circle',
                        'target': 'valve_cap',
                        'label': 'まずキャップを外す',
                        'color': 'yellow'
                    }
                ],
                animation='pulse'
            )
            
            return ar_content
        
        elif action.type == 'open_trunk':
            # トランク内の修理キット位置を表示
            ar_content = await self.ar_generator.create_overlay(
                target_object='trunk_interior',
                vehicle_model=context.vehicle.model,
                annotations=[
                    {
                        'type': 'highlight',
                        'target': 'repair_kit_location',
                        'label': '修理キットはここ',
                        'color': 'green'
                    }
                ]
            )
            
            return ar_content
```

---

## ユースケース実装例

### ユースケース1: パンク対応（完全版）

```python
class PunctureRepairOrchestrator:
    """パンク修理オーケストレーター"""
    
    def __init__(self):
        self.behavior_predictor = BehaviorPredictionAgent()
        self.channel_selector = ChannelSelectionAgent()
        self.timing_optimizer = TimingOptimizationAgent()
        self.content_generator = ContentGenerationAgent()
        self.state_tracker = StateTracker()
    
    async def handle_puncture_event(self, event):
        """パンクイベント処理"""
        
        # 初期状態設定
        await self.state_tracker.set_state({
            'scenario': 'puncture_repair',
            'stage': 'detection',
            'user_location': 'in_vehicle_driving'
        })
        
        # ステージ1: 運転中の警告
        await self.stage_1_driving_alert(event)
        
        # 状態変化を監視
        await self.monitor_state_changes()
    
    async def stage_1_driving_alert(self, event):
        """ステージ1: 運転中の警告"""
        
        # 1. 次の行動を予測
        prediction = await self.behavior_predictor.predict_next_action(
            current_state={
                'user_location': 'in_vehicle_driving',
                'vehicle_speed': event.vehicle.speed,
                'tire_pressure': event.tire_pressure
            },
            context_history=await self.state_tracker.get_history()
        )
        # 予測結果: "find_safe_place" (安全な場所を探す)
        
        # 2. 最適チャネル選択
        channel = await self.channel_selector.select_best_channel(
            predicted_action=prediction,
            current_state=await self.state_tracker.get_current_state(),
            user_profile=event.user_profile
        )
        # 選択結果: in_car_display + voice
        
        # 3. タイミング最適化
        timing = await self.timing_optimizer.optimize_delivery_timing(
            predicted_action=prediction,
            channel=channel,
            content={'complexity': 'low'}
        )
        # タイミング: immediate (緊急)
        
        # 4. コンテンツ生成
        content = await self.content_generator.generate_content(
            predicted_action=prediction,
            channel=channel,
            modality=['visual', 'audio', 'navigation'],
            context=event.context
        )
        
        # 5. 配信
        await self.deliver_content(
            channel=channel,
            content=content,
            timing=timing
        )
        
        # 配信内容:
        # - 車載ディスプレイ: 「⚠️ 右前タイヤ空気圧低下」+ 地図（安全な停車場所）
        # - 音声: 「右前タイヤの空気圧が低下しています。安全な場所に停車してください」
    
    async def monitor_state_changes(self):
        """状態変化の監視"""
        
        async for state_change in self.state_tracker.watch_changes():
            
            # ステージ2: 停車検知
            if state_change.event == 'vehicle_stopped':
                await self.stage_2_stopped_guidance(state_change)
            
            # ステージ3: 車外移動検知
            elif state_change.event == 'user_exited_vehicle':
                await self.stage_3_trunk_guidance(state_change)
            
            # ステージ4: トランク開閉検知
            elif state_change.event == 'trunk_opened_closed':
                await self.stage_4_approach_tire(state_change)
            
            # ステージ5: タイヤ接近検知
            elif state_change.event == 'user_near_tire':
                await self.stage_5_repair_guidance(state_change)
            
            # ステージ6: 修理完了検知
            elif state_change.event == 'repair_completed':
                await self.stage_6_completion(state_change)
    
    async def stage_2_stopped_guidance(self, state_change):
        """ステージ2: 停車時のガイダンス"""
        
        # 予測: ユーザーは詳細情報を確認したい → 次に車外に出る
        prediction = await self.behavior_predictor.predict_next_action(
            current_state={
                'user_location': 'in_vehicle_stopped',
                'vehicle_speed': 0,
                'door_status': 'closed'
            },
            context_history=await self.state_tracker.get_history()
        )
        
        # チャネル: 車載ディスプレイ（詳細表示可能）
        channel = await self.channel_selector.select_best_channel(
            predicted_action=prediction,
            current_state=await self.state_tracker.get_current_state(),
            user_profile=state_change.user_profile
        )
        
        # コンテンツ: 詳細説明 + 動画
        content = await self.content_generator.generate_content(
            predicted_action=prediction,
            channel=channel,
            modality=['visual', 'audio', 'video'],
            context=state_change.context
        )
        
        await self.deliver_content(channel=channel, content=content, timing={'immediate': True})
        
        # 配信内容:
        # - 車載ディスプレイ:
        #   「パンク応急修理キットで対応できます」
        #   「トランクから修理キットを取り出してください」
        #   [動画] 修理キットの使い方（30秒）
        #   [ボタン] 「手順を見る」「音声ガイドを開始」
    
    async def stage_3_trunk_guidance(self, state_change):
        """ステージ3: トランクへの誘導"""
        
        # 予測: ユーザーは車外にいる → 次にトランクを開ける
        # チャネル: スマホ（持ち運び可能）
        
        channel = await self.channel_selector.select_best_channel(
            predicted_action={'type': 'open_trunk'},
            current_state={'user_location': 'outside_vehicle'},
            user_profile=state_change.user_profile
        )
        
        # タイミング: 3秒後（ドアを閉めて歩き始めるまで）
        timing = await self.timing_optimizer.optimize_delivery_timing(
            predicted_action={'type': 'open_trunk', 'estimated_seconds': 10},
            channel=channel,
            content={'complexity': 'low'}
        )
        
        content = await self.content_generator.generate_content(
            predicted_action={'type': 'open_trunk'},
            channel=channel,
            modality=['visual', 'audio', 'haptic'],
            context=state_change.context
        )
        
        await self.deliver_content(channel=channel, content=content, timing=timing)
        
        # 配信内容:
        # - スマホ:
        #   [プッシュ通知] 「トランクを開けて修理キットを取り出してください」
        #   [振動] 短い振動で注意喚起
        #   [画面] トランクの位置を矢印で表示
    
    async def stage_4_approach_tire(self, state_change):
        """ステージ4: タイヤへの接近誘導"""
        
        # 予測: ユーザーは修理キットを持っている → 次にタイヤに近づく
        # チャネル: スマホ（GPS誘導）+ 音声（ハンズフリー）
        
        channel = await self.channel_selector.select_best_channel(
            predicted_action={'type': 'approach_tire'},
            current_state={'user_location': 'near_trunk', 'hands_occupied': True},
            user_profile=state_change.user_profile
        )
        
        content = await self.content_generator.generate_content(
            predicted_action={'type': 'approach_tire'},
            channel=channel,
            modality=['audio', 'visual'],  # 音声メイン
            context=state_change.context
        )
        
        await self.deliver_content(channel=channel, content=content, timing={'immediate': True})
        
        # 配信内容:
        # - スマホ音声: 「右前タイヤに近づいてください。音声で手順を案内します」
        # - スマホ画面: 車両の図で右前タイヤを強調表示
    
    async def stage_5_repair_guidance(self, state_change):
        """ステージ5: 修理作業のステップガイド"""
        
        # 予測: ユーザーはタイヤの前にいる → 次に修理作業を開始
        # チャネル: スマホ（AR + 音声）
        
        channel = await self.channel_selector.select_best_channel(
            predicted_action={'type': 'perform_repair'},
            current_state={'user_location': 'near_tire', 'hands_occupied': True},
            user_profile=state_change.user_profile
        )
        
        content = await self.content_generator.generate_content(
            predicted_action={'type': 'perform_repair'},
            channel=channel,
            modality=['ar', 'audio', 'step_by_step'],
            context=state_change.context
        )
        
        # ステップバイステップガイド開始
        await self.start_step_by_step_guidance(
            channel=channel,
            content=content,
            steps=[
                {'step': 1, 'action': 'remove_valve_cap', 'duration': 10},
                {'step': 2, 'action': 'attach_nozzle', 'duration': 15},
                {'step': 3, 'action': 'inject_sealant', 'duration': 60},
                {'step': 4, 'action': 'inflate_tire', 'duration': 120},
                {'step': 5, 'action': 'check_pressure', 'duration': 30},
                {'step': 6, 'action': 'replace_valve_cap', 'duration': 10}
            ]
        )
        
        # 配信内容:
        # - スマホAR: バルブ位置を画面上で強調表示
        # - 音声: 「ステップ1: バルブキャップを反時計回りに回して外してください」
        # - 画面: 進捗バー（ステップ1/6）
        # - 次のステップ: ユーザーが「次へ」と言うか、10秒経過で自動進行
    
    async def stage_6_completion(self, state_change):
        """ステージ6: 完了とアフターケア"""
        
        # 予測: ユーザーは片付けたい → 次に車に戻る
        # チャネル: スマホ（完了通知 + 次のアクション提案）
        
        content = await self.content_generator.generate_content(
            predicted_action={'type': 'return_to_vehicle'},
            channel={'type': 'smartphone'},
            modality=['visual', 'audio'],
            context=state_change.context
        )
        
        await self.deliver_content(
            channel={'type': 'smartphone'},
            content=content,
            timing={'immediate': True}
        )
        
        # 配信内容:
        # - スマホ:
        #   [通知] 「✅ 応急修理完了！」
        #   [メッセージ] 「修理キットをトランクに戻して、最寄りのディーラーへ向かってください」
        #   [地図] 最寄りディーラー3件（距離・営業時間付き）
        #   [ボタン] 「ナビ開始」「予約する」
        #   [注意] 「時速80km以下で走行してください」
```

---

### ユースケース2: 雨天時のワイパー案内

```python
async def handle_rain_scenario(self, event):
    """雨天シナリオ"""
    
    # ステージ1: 降雨検知（運転中）
    if event.weather == 'rain' and event.vehicle.wiper_status == 'off':
        
        # 予測: ユーザーは手動でワイパーを操作するか、自動を知らない
        prediction = await self.behavior_predictor.predict_next_action(
            current_state={
                'weather': 'rain',
                'wiper_status': 'off',
                'user_location': 'driving'
            },
            context_history=[]
        )
        
        # チャネル: 音声（運転中は画面を見られない）
        channel = await self.channel_selector.select_best_channel(
            predicted_action=prediction,
            current_state={'user_location': 'driving'},
            user_profile=event.user_profile
        )
        
        # タイミング: 即座（安全に関わる）
        content = {
            'audio': {
                'script': '雨が降り始めました。オートワイパーを有効にしますか？',
                'action_prompt': '「はい」と言うか、ステアリングのボタンを押してください'
            },
            'visual': {
                'hud_display': 'オートワイパー有効化',
                'icon': 'wiper_auto'
            }
        }
        
        await self.deliver_content(channel=channel, content=content, timing={'immediate': True})
        
        # ユーザー応答待機
        response = await self.wait_for_user_response(timeout=10)
        
        if response == 'yes':
            # 自動でワイパーを有効化
            await self.vehicle_control.enable_auto_wiper()
            await self.deliver_content(
                channel={'type': 'voice'},
                content={'audio': {'script': 'オートワイパーを有効にしました'}},
                timing={'immediate': True}
            )
        
        # ステージ2: 停車後に詳細説明（次回のため）
        await self.schedule_educational_content(
            trigger='vehicle_stopped',
            content_type='auto_wiper_tutorial',
            channel='smartphone',
            priority='low'
        )
```

---

## 技術仕様

### 状態管理

```python
class StateTracker:
    """状態トラッカー"""
    
    def __init__(self):
        self.current_state = {}
        self.state_history = []
        self.state_machine = StateMachine()
        self.event_bus = EventBus()
    
    async def update_state(self, new_state):
        """状態更新"""
        
        # 状態変化を検出
        state_changes = self.detect_changes(self.current_state, new_state)
        
        # 履歴に記録
        self.state_history.append({
            'timestamp': datetime.now(),
            'previous_state': self.current_state,
            'new_state': new_state,
            'changes': state_changes
        })
        
        # 現在状態を更新
        self.current_state = new_state
        
        # 状態遷移イベントを発行
        for change in state_changes:
            await self.event_bus.publish(
                event_type=f'state_change.{change.key}',
                data=change
            )
        
        # ステートマシンを更新
        await self.state_machine.transition(state_changes)
    
    def detect_changes(self, old_state, new_state):
        """状態変化検出"""
        
        changes = []
        
        # 位置変化
        if old_state.get('user_location') != new_state.get('user_location'):
            changes.append({
                'key': 'user_location',
                'old_value': old_state.get('user_location'),
                'new_value': new_state.get('user_location'),
                'significance': 'high'
            })
        
        # 車両状態変化
        if old_state.get('vehicle_speed', 0) > 0 and new_state.get('vehicle_speed', 0) == 0:
            changes.append({
                'key': 'vehicle_stopped',
                'old_value': old_state.get('vehicle_speed'),
                'new_value': 0,
                'significance': 'high'
            })
        
        # ドア開閉
        if old_state.get('door_status') != new_state.get('door_status'):
            changes.append({
                'key': 'door_status',
                'old_value': old_state.get('door_status'),
                'new_value': new_state.get('door_status'),
                'significance': 'medium'
            })
        
        return changes
```

### デバイス可用性トラッキング

```python
class DeviceAvailabilityTracker:
    """デバイス可用性トラッカー"""
    
    def __init__(self):
        self.device_registry = DeviceRegistry()
        self.connectivity_monitor = ConnectivityMonitor()
    
    async def get_available_devices(self, user_id):
        """利用可能デバイス取得"""
        
        # ユーザーの登録デバイス取得
        registered_devices = await self.device_registry.get_user_devices(user_id)
        
        # 各デバイスの可用性チェック
        available_devices = []
        for device in registered_devices:
            availability = await self.check_device_availability(device)
            if availability.is_available:
                available_devices.append({
                    'device': device,
                    'availability': availability,
                    'capabilities': await self.get_device_capabilities(device)
                })
        
        return available_devices
    
    async def check_device_availability(self, device):
        """デバイス可用性チェック"""
        
        checks = {
            'is_online': await self.connectivity_monitor.is_connected(device),
            'battery_level': await self.get_battery_level(device),
            'screen_state': await self.get_screen_state(device),
            'location': await self.get_device_location(device),
            'user_interaction': await self.get_last_interaction(device)
        }
        
        # 総合判定
        is_available = (
            checks['is_online'] and
            checks['battery_level'] > 10 and
            (checks['screen_state'] == 'on' or device.type == 'voice')
        )
        
        return {
            'is_available': is_available,
            'checks': checks,
            'confidence': self.calculate_availability_confidence(checks)
        }
```

---

## 開発計画

### Phase 2.6: マルチモーダル予測エージェント開発（追加）

**期間:** 2ヶ月（Phase 2と並行）

**タスク:**

```yaml
2.6.1 行動予測エージェント開発:
  - [ ] シナリオDB構築（100機能×主要シナリオ）
  - [ ] LSTMベース行動予測モデル訓練
  - [ ] LLMベース意図推定実装
  - [ ] アンサンブル予測ロジック
  - [ ] 予測精度評価（目標: 80%以上）

2.6.2 チャネル選択エージェント開発:
  - [ ] チャネルスコアリングロジック実装
  - [ ] デバイス可用性トラッキング
  - [ ] ユーザー嗜好学習モデル
  - [ ] フォールバック機構
  - [ ] チャネル選択精度評価（目標: 85%以上）

2.6.3 タイミング最適化エージェント開発:
  - [ ] 行動タイミング予測モデル
  - [ ] 認知負荷推定モデル
  - [ ] 先回り時間最適化アルゴリズム
  - [ ] タイミング精度評価（目標: ±3秒以内）

2.6.4 コンテンツ生成エージェント開発:
  - [ ] マルチモーダルコンテンツ生成
  - [ ] ARコンテンツ生成パイプライン
  - [ ] 音声スクリプト生成（LLM）
  - [ ] ハプティックパターン設計
  - [ ] コンテンツ品質評価

2.6.5 統合・オーケストレーション:
  - [ ] エージェント間通信基盤
  - [ ] 状態管理システム
  - [ ] イベント駆動アーキテクチャ
  - [ ] エージェント監視・ヘルスチェック
  - [ ] エンドツーエンドテスト

2.6.6 主要シナリオ実装:
  - [ ] パンク対応シナリオ（完全版）
  - [ ] 雨天時ワイパー案内
  - [ ] 高速道路進入時ADAS案内
  - [ ] 駐車時支援機能案内
  - [ ] バッテリー低下時対応案内
```

**技術スタック:**

```yaml
エージェントフレームワーク:
  - LangChain / LangGraph（エージェント構築）
  - AutoGen（マルチエージェント協調）
  - CrewAI（タスクオーケストレーション）

機械学習:
  - PyTorch（行動予測モデル）
  - Transformers（LLM統合）
  - scikit-learn（スコアリング）

状態管理:
  - Redis（リアルタイム状態）
  - PostgreSQL（履歴保存）
  - Apache Kafka（イベントストリーム）

AR/マルチモーダル:
  - ARKit / ARCore SDK
  - Unity（ARコンテンツ制作）
  - Google TTS / AWS Polly（音声合成）
```

**KPI:**

| 指標 | 目標値 | 測定方法 |
|-----|--------|---------|
| 行動予測精度 | 80%以上 | テストシナリオ評価 |
| チャネル選択精度 | 85%以上 | ユーザー満足度調査 |
| タイミング精度 | ±3秒以内 | ログ分析 |
| エージェント応答時間 | <500ms | APM |
| ユーザー満足度 | 4.5/5.0以上 | アンケート |
| 先回り成功率 | 75%以上 | 行動ログ分析 |

**成果物:**

- マルチモーダル予測エージェントシステム
- 主要5シナリオの実装
- エージェント設計ドキュメント
- 評価レポート

---

## まとめ

### このエージェントシステムの特徴

1. **予測的**: ユーザーの次の行動を予測
2. **適応的**: 状況に応じて最適なチャネルを選択
3. **先回り**: 必要な情報を事前に配信
4. **シームレス**: デバイス間で文脈を引き継ぐ
5. **学習的**: ユーザー反応から継続的に改善

### 従来のシステムとの違い

| 項目 | 従来システム | マルチモーダル予測エージェント |
|-----|------------|---------------------------|
| 情報配信 | ユーザーが検索 | システムが先回りして配信 |
| チャネル | 固定（スマホのみ等） | 状況に応じて最適選択 |
| タイミング | ユーザー主導 | AIが最適タイミング判断 |
| 連携 | デバイス間で分断 | シームレスに文脈引き継ぎ |
| 学習 | 静的ルール | 継続的に学習・改善 |

このシステムにより、ユーザーは**考える前に必要な情報が届く**体験を実現できます！

---

**文書履歴**

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|--------|
| 1.0 | 2025-11-12 | 初版作成 | AI Assistant |















