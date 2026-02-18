var SCROLL_CONTAINER_ID = (typeof window !== 'undefined' && window.CC_CHAT_SCROLL_ID) ? window.CC_CHAT_SCROLL_ID : 'ccChatScroll';
function getScrollEl() { return document.getElementById(SCROLL_CONTAINER_ID); }

        // OEMダッシュボード連携（サポートスタッフ側・localStorage: doi_oem_dashboard_stats）
        var OEM_STATS_KEY = 'doi_oem_dashboard_stats';
        function getDefaultOemStats() {
            return { totalQuestionsEnduser: 25000, totalQuestionsStaff: 3340, answerCorrectEnduser: 23000, answerCorrectStaff: 3080, searchTopics: { 'Bluetooth接続の設定方法': { enduser: 2000, staff: 340 }, 'エアコンの使い方': { enduser: 1600, staff: 290 }, 'ワイパーの操作方法': { enduser: 1300, staff: 260 }, 'クルーズコントロールの設定': { enduser: 1000, staff: 230 }, 'タイヤ空気圧の確認方法': { enduser: 800, staff: 180 }, '警告灯が点灯': { enduser: 500, staff: 100 } }, proactiveSent: 8340, proactiveViewed: 3753, featureUtilizationUp: 15, activeUsers: 12450 };
        }
        function getOemStats() {
            try {
                var raw = localStorage.getItem(OEM_STATS_KEY);
                if (!raw) return getDefaultOemStats();
                var s = JSON.parse(raw);
                if (!s.searchTopics) s.searchTopics = getDefaultOemStats().searchTopics;
                return s;
            } catch (e) { return getDefaultOemStats(); }
        }
        function setOemStats(s) {
            try {
                localStorage.setItem(OEM_STATS_KEY, JSON.stringify(s));
                try { (new BroadcastChannel('doi_oem_stats_broadcast')).postMessage('update'); } catch (e) {}
            } catch (e) {}
        }
        function mapQueryToTopic(q) {
            var t = (q || '').toLowerCase();
            if (t.indexOf('bluetooth') >= 0 || t.indexOf('ブルートゥース') >= 0) return 'Bluetooth接続の設定方法';
            if (t.indexOf('エアコン') >= 0 || t.indexOf('冷えない') >= 0) return 'エアコンの使い方';
            if (t.indexOf('ワイパー') >= 0) return 'ワイパーの操作方法';
            if (t.indexOf('クルーズ') >= 0) return 'クルーズコントロールの設定';
            if (t.indexOf('タイヤ') >= 0 || t.indexOf('空気圧') >= 0) return 'タイヤ空気圧の確認方法';
            if (t.indexOf('警告灯') >= 0) return '警告灯が点灯';
            if (t.indexOf('ドア') >= 0 || t.indexOf('開かない') >= 0) return 'ドアが開かない';
            return 'その他';
        }
        function recordOemQuestion(query, source) {
            var s = getOemStats();
            if (source === 'staff') {
                s.totalQuestionsStaff = (s.totalQuestionsStaff || 0) + 1;
                s.answerCorrectStaff = (s.answerCorrectStaff || 0) + (Math.random() < 0.92 ? 1 : 0);
            }
            var topic = mapQueryToTopic(query);
            if (!s.searchTopics[topic]) s.searchTopics[topic] = { enduser: 0, staff: 0 };
            s.searchTopics[topic].staff = (s.searchTopics[topic].staff || 0) + 1;
            setOemStats(s);
        }

        // ========== T1-T6 フェーズ1: モック知識ベース・状態・エンジン ==========
        const T16_KB_DOOR_NOT_OPEN = {
            event_id: 'DOOR_NOT_OPEN',
            cause_candidates: [
                { cause_id: 'KEY_BATTERY_EMPTY', description: 'キー電池切れ', required_observations: ['key_indicator_light'], risk_level: 'low', action_group: 'battery_replace' },
                { cause_id: 'KEY_FAULT', description: 'キー故障', required_observations: ['key_indicator_light'], risk_level: 'low', action_group: 'dealer' },
                { cause_id: 'RADIO_INTERFERENCE', description: '電波干渉', required_observations: ['key_indicator_light', 'location'], risk_level: 'low', action_group: 'retry_or_relocate' },
                { cause_id: 'VEHICLE_12V_LOW', description: '車両12V低下', required_observations: ['key_indicator_light', 'vehicle_12v'], risk_level: 'low', action_group: 'jump_start' },
                { cause_id: 'LOCK_ACTUATOR_FAULT', description: 'ドアロック故障', required_observations: ['other_key_result'], risk_level: 'medium', action_group: 'dealer' },
                { cause_id: 'USER_OPERATION', description: '操作条件不一致', required_observations: ['key_indicator_light', 'operation_condition'], risk_level: 'low', action_group: 'guide' }
            ],
            t3_question: {
                question_id: 'Q_DOOR_001',
                question_text: 'スマートキーのボタンを押すとランプは点きますか？',
                answer_type: 'yes_no',
                expected_split: { yes: ['RADIO_INTERFERENCE', 'VEHICLE_12V_LOW', 'USER_OPERATION', 'LOCK_ACTUATOR_FAULT'], no: ['KEY_BATTERY_EMPTY', 'KEY_FAULT'] },
                priority: 1
            },
            action_cards_by_cause: {
                KEY_BATTERY_EMPTY: [
                    { action_id: 'A_DOOR_001', guide_id: 'GUIDE-001', title: '今すぐ開ける：機械キーで解錠', steps: ['スマートキー側面のボタンを押して機械キーを取り出す', '運転席ドアの鍵穴に差し込んで回す'], duration: '約30秒', required_items: [], risk_notice: null, alternative: '開かない場合はロードサービスへ', is_immediate: true },
                    { action_id: 'A_DOOR_002', guide_id: 'GUIDE-005', title: '恒久対応：電池交換', steps: ['CR2032（またはCR2450）を用意', 'キーを開けて電池を交換', '動作確認'], duration: '約3分', required_items: ['CR2032 または CR2450（ボタン電池）'], risk_notice: '部品破損の恐れがあるため、販売店での交換を推奨します。', alternative: '電池購入先の案内へ', is_immediate: false },
                    { action_id: 'A_DOOR_003', guide_id: 'GUIDE-006', title: '不安なら：販売店・ロードサービス', steps: ['位置共有・症状要約付きで連絡'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                RADIO_INTERFERENCE: [
                    { action_id: 'A_DOOR_004', guide_id: 'GUIDE-008', title: 'キーをドアハンドルに近づけて再試行', steps: ['スマートキーをドアハンドルにできるだけ近づけて操作', '数メートル移動して再試行'], duration: '約1分', required_items: [], risk_notice: null, alternative: '機械キーで開ける', is_immediate: true },
                    { action_id: 'A_DOOR_005', guide_id: null, title: '予備のスマートキーで試す', steps: ['予備のスマートキーがあれば、同じようにドアの解錠を試す'], duration: '約1分', required_items: [], risk_notice: null, alternative: '予備キーがない場合は機械キーで開ける', is_immediate: true },
                    { action_id: 'A_DOOR_001', guide_id: 'GUIDE-001', title: '今すぐ開ける：機械キーで解錠', steps: ['スマートキー側面のボタンを押して機械キーを取り出す', '運転席ドアの鍵穴に差し込んで回す'], duration: '約30秒', required_items: [], risk_notice: null, alternative: 'ロードサービスへ', is_immediate: true }
                ],
                LOCK_ACTUATOR_FAULT: [
                    { action_id: 'A_DOOR_005', guide_id: null, title: '予備のスマートキーで試す', steps: ['予備のスマートキーがあれば、同じようにドアの解錠を試す'], duration: '約1分', required_items: [], risk_notice: null, alternative: '予備キーがない場合は機械キーで開ける', is_immediate: true },
                    { action_id: 'A_DOOR_001', guide_id: 'GUIDE-001', title: '今すぐ開ける：機械キーで解錠', steps: ['スマートキー側面のボタンを押して機械キーを取り出す', '運転席ドアの鍵穴に差し込んで回す'], duration: '約30秒', required_items: [], risk_notice: null, alternative: '開かない場合はロードサービスへ', is_immediate: true },
                    { action_id: 'A_DOOR_003', guide_id: 'GUIDE-006', title: '販売店・ロードサービスに連絡', steps: ['位置共有・症状要約付きで連絡'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                _default: [
                    { action_id: 'A_DOOR_005', guide_id: null, title: '予備のスマートキーで試す', steps: ['予備のスマートキーがあれば、同じようにドアの解錠を試す'], duration: '約1分', required_items: [], risk_notice: null, alternative: '予備キーがない場合は機械キーで開ける', is_immediate: true },
                    { action_id: 'A_DOOR_001', guide_id: 'GUIDE-001', title: '今すぐ開ける：機械キーで解錠', steps: ['スマートキー側面のボタンを押して機械キーを取り出す', '運転席ドアの鍵穴に差し込んで回す'], duration: '約30秒', required_items: [], risk_notice: null, alternative: '開かない場合はロードサービスへ', is_immediate: true },
                    { action_id: 'A_DOOR_003', guide_id: 'GUIDE-006', title: '販売店・ロードサービス', steps: ['位置共有・症状要約付きで連絡'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ]
            },
            escalation_option: { dealer: '販売店予約', road_service: 'ロードサービス' }
        };

        // 警告灯アイコン用SVG（取説イメージに準拠: https://manual.toyota.jp/aqua/2509/hev/ja_JP/contents/vhch07se020402.php ）
        var WARNING_LIGHT_ICONS = {
            brake_red: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='28' fill='none' stroke='%23e53935' stroke-width='3'/%3E%3Ctext x='32' y='42' text-anchor='middle' fill='%23e53935' font-size='32' font-weight='bold'%3E!%3C/text%3E%3Cpath d='M14 32 Q32 10 50 32' fill='none' stroke='%23e53935' stroke-width='2' stroke-dasharray='4 3'/%3E%3Cpath d='M14 32 Q32 54 50 32' fill='none' stroke='%23e53935' stroke-width='2' stroke-dasharray='4 3'/%3E%3C/svg%3E",
            brake_yellow: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='28' fill='none' stroke='%23ffa726' stroke-width='3'/%3E%3Ctext x='32' y='42' text-anchor='middle' fill='%23ffa726' font-size='32' font-weight='bold'%3E!%3C/text%3E%3Cpath d='M14 32 Q32 10 50 32' fill='none' stroke='%23ffa726' stroke-width='2' stroke-dasharray='4 3'/%3E%3Cpath d='M14 32 Q32 54 50 32' fill='none' stroke='%23ffa726' stroke-width='2' stroke-dasharray='4 3'/%3E%3C/svg%3E",
            coolant: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='26' y='8' width='12' height='40' rx='4' fill='none' stroke='%23e53935' stroke-width='2'/%3E%3Ccircle cx='32' cy='52' r='6' fill='none' stroke='%23e53935' stroke-width='2'/%3E%3Cpath d='M32 20 L32 40' stroke='%23e53935' stroke-width='2'/%3E%3C/svg%3E",
            oil: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cellipse cx='32' cy='48' rx='20' ry='6' fill='none' stroke='%23e53935' stroke-width='2'/%3E%3Cpath d='M20 48 L20 24 L32 14 L44 24 L44 48' fill='none' stroke='%23e53935' stroke-width='2'/%3E%3Ctext x='32' y='36' text-anchor='middle' fill='%23e53935' font-size='14'%3Eoil%3C/text%3E%3C/svg%3E",
            charge: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M32 8 L20 28 L30 28 L22 56 L44 32 L32 32 Z' fill='none' stroke='%23e53935' stroke-width='2' stroke-linejoin='round'/%3E%3C/svg%3E",
            engine: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='12' y='24' width='40' height='24' rx='2' fill='none' stroke='%23ffa726' stroke-width='2'/%3E%3Cpath d='M28 24 L28 16 L36 16 L36 24' fill='none' stroke='%23ffa726' stroke-width='2'/%3E%3Cpath d='M20 32 L44 32' stroke='%23ffa726' stroke-width='2'/%3E%3C/svg%3E",
            tyre: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='none' stroke='%23ffa726' stroke-width='2'/%3E%3Ctext x='32' y='40' text-anchor='middle' fill='%23ffa726' font-size='28' font-weight='bold'%3E!%3C/text%3E%3C/svg%3E",
            abs: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext x='32' y='38' text-anchor='middle' fill='%23ffa726' font-size='18' font-weight='bold'%3EABS%3C/text%3E%3C/svg%3E",
            other: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='26' fill='none' stroke='%23888' stroke-width='2'/%3E%3Ctext x='32' y='42' text-anchor='middle' fill='%23888' font-size='32' font-weight='bold'%3E!%3C/text%3E%3C/svg%3E"
        };

        const T16_KB_WARNING_LIGHT = {
            event_id: 'WARNING_LIGHT',
            cause_candidates: [
                { cause_id: 'ENGINE_WARNING', description: 'エンジン警告灯（システム異常）', required_observations: ['lamp_color'], risk_level: 'medium', action_group: 'dealer' },
                { cause_id: 'ENGINE_OIL', description: 'エンジンオイル', required_observations: ['lamp_color'], risk_level: 'medium', action_group: 'check_oil' },
                { cause_id: 'BRAKE_SYSTEM', description: 'ブレーキ系統', required_observations: ['lamp_color'], risk_level: 'high', action_group: 'dealer' },
                { cause_id: 'ENGINE_COOLANT', description: 'エンジン・冷却系', required_observations: ['lamp_color'], risk_level: 'high', action_group: 'dealer' },
                { cause_id: 'BATTERY_CHARGE', description: 'バッテリー充電', required_observations: ['lamp_color'], risk_level: 'medium', action_group: 'jump_start' },
                { cause_id: 'TYRE_PRESSURE', description: 'タイヤ空気圧', required_observations: ['lamp_color'], risk_level: 'low', action_group: 'tyre_check' },
                { cause_id: 'OTHER_WARNING', description: 'その他警告', required_observations: ['lamp_color'], risk_level: 'medium', action_group: 'dealer' }
            ],
            warning_light_options: [
                { option_id: 'BRAKE_RED', label: 'ブレーキ警告灯（赤）', cause_id: 'BRAKE_SYSTEM', icon: 'brake_red' },
                { option_id: 'BRAKE_YELLOW', label: 'ブレーキ警告灯（黄）', cause_id: 'BRAKE_SYSTEM', icon: 'brake_yellow' },
                { option_id: 'COOLANT', label: '高水温警告灯', cause_id: 'ENGINE_COOLANT', icon: 'coolant' },
                { option_id: 'HYBRID_OVERHEAT', label: 'ハイブリッドシステム過熱警告灯', cause_id: 'ENGINE_COOLANT', icon: 'coolant' },
                { option_id: 'CHARGE', label: '充電警告灯', cause_id: 'BATTERY_CHARGE', icon: 'charge' },
                { option_id: 'OIL', label: '油圧警告灯', cause_id: 'ENGINE_OIL', icon: 'oil' },
                { option_id: 'ENGINE', label: 'エンジン警告灯', cause_id: 'ENGINE_WARNING', icon: 'engine' },
                { option_id: 'ABS', label: 'ABS＆ブレーキアシスト警告灯', cause_id: 'BRAKE_SYSTEM', icon: 'abs' },
                { option_id: 'TYRE', label: 'タイヤ空気圧警告灯', cause_id: 'TYRE_PRESSURE', icon: 'tyre' },
                { option_id: 'OTHER', label: 'その他・わからない', cause_id: 'OTHER_WARNING', icon: 'other' }
            ],
            t3_question: {
                question_id: 'Q_WARN_001',
                question_text: '点灯している警告灯を選んでください。<br><a href="https://manual.toyota.jp/aqua/2509/hev/ja_JP/contents/vhch07se020402.php" target="_blank" rel="noopener" style="color:#BF00FF; font-size:0.9em;">※ 取説「警告灯がついたときは」で詳細を確認できます</a>',
                answer_type: 'single_choice',
                options_ref: 'warning_light_options',
                priority: 1
            },
            action_cards_by_cause: {
                ENGINE_WARNING: [
                    { action_id: 'A_WARN_ENG', guide_id: null, title: 'エンジン警告灯が点灯したとき（取説ch07準拠）', steps: ['マルチインフォメーションディスプレイに表示される警告メッセージを確認する', '表示内容に従って対処する', '点灯したままのときはシステム異常のおそれがあるため、トヨタ販売店で点検を受けてください'], duration: null, required_items: [], risk_notice: '作動確認のためパワースイッチをONにすると点灯し、数秒後またはハイブリッドシステム始動で消灯するのが正常です。点灯しない場合も点検を。', alternative: '販売店へ', is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店で点検', steps: ['エンジン警告灯の点灯として点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                BRAKE_SYSTEM: [
                    { action_id: 'A_WARN_001', guide_id: null, title: '安全な場所に停車し、すぐに点検を', steps: ['速やかに安全な場所へ停車', 'エンジンを止める', '販売店・ロードサービスに連絡'], duration: null, required_items: [], risk_notice: 'ブレーキ系統の警告のため、走行は避けてください。', alternative: null, is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店・ロードサービスに連絡', steps: ['位置・症状を伝えて引き取り・点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                ENGINE_COOLANT: [
                    { action_id: 'A_WARN_002', guide_id: null, title: 'エンジンを止めて冷却を確認', steps: ['安全な場所に停車', 'エンジンを止めて冷ます', '冷却水の量を確認（取説参照）'], duration: '約10分以上', required_items: [], risk_notice: '無理に走行するとエンジン損傷の恐れがあります。', alternative: 'ロードサービスへ', is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店・ロードサービスに連絡', steps: ['位置・症状を伝えて点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                ENGINE_OIL: [
                    { action_id: 'A_WARN_004', guide_id: null, title: 'オイル量を確認', steps: ['水平な場所に停車する', 'エンジンを暖機した後、ハイブリッドシステムを停止する', '5分以上経過してから、レベルゲージ（オイル量計測棒）でオイル量を確認する'], duration: '約5分', required_items: [], risk_notice: 'オイル不足の場合は走行を控え、補充または点検を。', alternative: '販売店へ', is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店で点検', steps: ['オイル交換・点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                TYRE_PRESSURE: [
                    { action_id: 'A_WARN_005', guide_id: null, title: 'タイヤ空気圧を確認・補充', steps: ['安全な場所に停車', 'タイヤ空気圧を計測し、規定値に合わせる'], duration: '約15分', required_items: ['空気圧計'], risk_notice: null, alternative: 'ガソリンスタンドや販売店で補充', is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店・ガソリンスタンドで確認', steps: ['空気圧チェック・補充を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                BATTERY_CHARGE: [
                    { action_id: 'A_WARN_006', guide_id: null, title: 'バッテリー充電状態を確認', steps: ['エンジンがかかる場合はしばらく走行して充電', 'かからない場合はロードサービスへ'], duration: null, required_items: [], risk_notice: null, alternative: 'ロードサービス', is_immediate: true },
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店・ロードサービスに連絡', steps: ['バッテリー点検・交換を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                _default: [
                    { action_id: 'A_WARN_003', guide_id: null, title: '販売店・ロードサービスに連絡', steps: ['警告灯の種類・症状を伝えて点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ]
            },
            escalation_option: { dealer: '販売店予約', road_service: 'ロードサービス' }
        };

        const T16_KB_BLUETOOTH = {
            event_id: 'BLUETOOTH',
            cause_candidates: [
                { cause_id: 'NOT_PAIRED', description: 'ペアリング未設定', required_observations: ['was_connected_before'], risk_level: 'low', action_group: 'pairing' },
                { cause_id: 'PAIRING_LOST', description: 'ペアリングが解除された', required_observations: ['was_connected_before'], risk_level: 'low', action_group: 're_pair' },
                { cause_id: 'DEVICE_BUSY', description: '他機器と接続中', required_observations: ['was_connected_before'], risk_level: 'low', action_group: 'disconnect_other' },
                { cause_id: 'AUDIO_SETTING', description: 'オーディオ設定・ソース', required_observations: ['was_connected_before'], risk_level: 'low', action_group: 'guide' },
                { cause_id: 'HARDWARE_FAULT', description: '機材の不調', required_observations: ['was_connected_before'], risk_level: 'medium', action_group: 'dealer' }
            ],
            t3_question: {
                question_id: 'Q_BT_001',
                question_text: '以前はこの機種で接続できていましたか？',
                answer_type: 'yes_no',
                expected_split: { yes: ['PAIRING_LOST', 'DEVICE_BUSY', 'AUDIO_SETTING', 'HARDWARE_FAULT'], no: ['NOT_PAIRED'] },
                label_yes: 'はい、以前は接続できた',
                label_no: 'いいえ、初めて接続する',
                priority: 1
            },
            action_cards_by_cause: {
                NOT_PAIRED: [
                    { action_id: 'A_BT_001', guide_id: null, title: 'ペアリング手順を実行', steps: ['車載オーディオでBluetooth設定を開く', 'スマホのBluetoothをONにし、車の名前を選択', '画面の指示に従ってペアリング'], duration: '約2分', required_items: [], risk_notice: null, alternative: '取説のBluetooth項目を参照', is_immediate: true },
                    { action_id: 'A_BT_002', guide_id: null, title: '取説でペアリング手順を確認', steps: ['車種別取説の「Bluetooth」「オーディオ」の項目を開く'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                PAIRING_LOST: [
                    { action_id: 'A_BT_003', guide_id: null, title: 'ペアリングをやり直す', steps: ['車載側で登録機種から当機を削除', 'スマホ側でも車を削除', '再度ペアリング手順を実行'], duration: '約3分', required_items: [], risk_notice: null, alternative: '販売店で設定確認', is_immediate: true },
                    { action_id: 'A_BT_001', guide_id: null, title: 'ペアリング手順を実行', steps: ['車載オーディオでBluetooth設定を開く', 'スマホのBluetoothをONにし、車の名前を選択'], duration: '約2分', required_items: [], risk_notice: null, alternative: null, is_immediate: true }
                ],
                DEVICE_BUSY: [
                    { action_id: 'A_BT_004', guide_id: null, title: '他機器の接続を解除', steps: ['車載オーディオで接続中の機種を切断', 'スマホのBluetoothで他機器をオフ', '再度この機種で接続'], duration: '約1分', required_items: [], risk_notice: null, alternative: null, is_immediate: true },
                    { action_id: 'A_BT_003', guide_id: null, title: 'ペアリングをやり直す', steps: ['登録削除後に再ペアリング'], duration: '約3分', required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                AUDIO_SETTING: [
                    { action_id: 'A_BT_005', guide_id: null, title: 'オーディオソースをBluetoothに切り替え', steps: ['オーディオ画面でソースを「Bluetooth」に選択', 'スマホで音楽再生や通話を試す'], duration: '約1分', required_items: [], risk_notice: null, alternative: null, is_immediate: true },
                    { action_id: 'A_BT_002', guide_id: null, title: '取説で設定を確認', steps: ['オーディオ・Bluetoothの項目を参照'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                HARDWARE_FAULT: [
                    { action_id: 'A_BT_003', guide_id: null, title: 'ペアリングをやり直して試す', steps: ['削除後に再ペアリング'], duration: '約3分', required_items: [], risk_notice: null, alternative: '改善しない場合は販売店へ', is_immediate: true },
                    { action_id: 'A_BT_006', guide_id: null, title: '販売店で点検', steps: ['オーディオ・Bluetoothの不調として点検を依頼'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ],
                _default: [
                    { action_id: 'A_BT_001', guide_id: null, title: 'ペアリング手順を実行', steps: ['車載オーディオとスマホでBluetooth設定から接続'], duration: '約2分', required_items: [], risk_notice: null, alternative: null, is_immediate: true },
                    { action_id: 'A_BT_002', guide_id: null, title: '取説で確認', steps: ['Bluetooth・オーディオの項目を参照'], duration: null, required_items: [], risk_notice: null, alternative: null, is_immediate: false }
                ]
            },
            escalation_option: { dealer: '販売店予約', road_service: null }
        };

        const T16_KB_BY_EVENT = {
            DOOR_NOT_OPEN: T16_KB_DOOR_NOT_OPEN,
            WARNING_LIGHT: T16_KB_WARNING_LIGHT,
            BLUETOOTH: T16_KB_BLUETOOTH
        };

        let T16State = {
            t1Output: null,
            t2Output: null,
            t3Output: null,
            observationResult: null,
            t4Output: null,
            t5Output: null,
            lastActionId: null,
            step: null
        };

        var T3_SKIP_CONFIDENCE_THRESHOLD = 0.8;

        function runT1(userInput) {
            const s = (userInput || '').trim();
            var event_id = null;
            var subtype = null;
            var confidence = 0.85;
            if (/ドアが開かない|スマートキー.*開かない|キー電池切れ|電池切れの表示/i.test(s)) {
                event_id = 'DOOR_NOT_OPEN';
                if (/キー電池切れの表示|電池切れの表示|電池が切れ|電池切れ/i.test(s)) {
                    subtype = 'battery_indicator';
                    confidence = 0.95;
                }
            } else if (/警告灯が点灯|警告灯.*点灯|ランプが点灯|エンジン警告/i.test(s)) {
                event_id = 'WARNING_LIGHT';
            } else if (/Bluetooth接続ができない|Bluetooth.*接続|ブルートゥース.*つながらない|ペアリング/i.test(s)) {
                event_id = 'BLUETOOTH';
            }
            if (!event_id) return null;
            return {
                event_id: event_id,
                subtype: subtype,
                confidence: confidence,
                urgency: event_id === 'WARNING_LIGHT' ? 0.8 : 0.7,
                psychological_risk: event_id === 'WARNING_LIGHT' ? 'high' : 'high',
                context_labels: { time_band: 'day', location_type: 'outside', vehicle_state: 'stopped' },
                evidence: ['user_selected_symptom']
            };
        }

        function runT2(t1Output) {
            if (!t1Output || !t1Output.event_id) return null;
            var kb = T16_KB_BY_EVENT[t1Output.event_id];
            if (!kb) return null;
            var candidates = kb.cause_candidates;
            if (t1Output.event_id === 'DOOR_NOT_OPEN' && t1Output.subtype === 'battery_indicator') {
                candidates = candidates.filter(function(c) { return c.cause_id === 'KEY_BATTERY_EMPTY'; });
            }
            return { cause_candidates: candidates };
        }

        function runT3(t2Output, t1Output) {
            if (!t2Output || !t2Output.cause_candidates || !t1Output) return null;
            var kb = T16_KB_BY_EVENT[t1Output.event_id];
            return kb ? kb.t3_question : null;
        }

        function runT4(observationAnswer, t2Output, t3Output, evidenceFromFailure, t1Output) {
            if (!t2Output) return null;
            if (observationAnswer == null && !t3Output) {
                var causes = t2Output.cause_candidates || [];
                var n = causes.length;
                var ranked = causes.map(function(c) {
                    return { cause_id: c.cause_id, confidence: n === 1 ? 1.0 : 1 / n, evidence: [] };
                });
                return { ranked_causes: ranked, status: 'READY_FOR_ACTION' };
            }
            if (!t3Output) return null;
            if (t3Output.answer_type === 'single_choice' && t1Output && observationAnswer != null) {
                var kb = T16_KB_BY_EVENT[t1Output.event_id];
                var opts = kb && kb[t3Output.options_ref];
                var sel = opts && opts.find(function(o) { return o.option_id === observationAnswer; });
                if (sel) {
                    var ranked = [{ cause_id: sel.cause_id, confidence: 0.95, evidence: ['warning_light=' + observationAnswer] }];
                    return { ranked_causes: ranked, status: 'READY_FOR_ACTION' };
                }
            }
            var split = t3Output.expected_split;
            if (!split) return null;
            const isYes = observationAnswer === true || observationAnswer === 'yes' || observationAnswer === 'はい';
            const favored = isYes ? (split.yes || []) : (split.no || []);
            const other = isYes ? (split.no || []) : (split.yes || []);
            const evidenceKey = 'key_indicator_light=' + (isYes ? 'yes' : 'no');
            var ranked = [];
            favored.forEach(cid => {
                ranked.push({ cause_id: cid, confidence: favored.length === 1 ? 0.72 : 0.5, evidence: [evidenceKey] });
            });
            if (ranked.length === 0) ranked.push({ cause_id: 'OTHER', confidence: 0.3, evidence: [] });
            other.forEach(cid => {
                ranked.push({ cause_id: cid, confidence: 0.15, evidence: [] });
            });
            ranked.sort((a, b) => b.confidence - a.confidence);
            if (evidenceFromFailure && (evidenceFromFailure.action_id === 'A_DOOR_004' || evidenceFromFailure.action_id === 'A_DOOR_005')) {
                ranked.forEach(function(r) {
                    if (r.cause_id === 'RADIO_INTERFERENCE') r.confidence *= 0.3;
                    else if (r.cause_id === 'LOCK_ACTUATOR_FAULT' || r.cause_id === 'VEHICLE_12V_LOW') r.confidence = Math.min(1, (r.confidence || 0.15) + 0.3);
                });
                ranked.sort((a, b) => b.confidence - a.confidence);
            }
            const top = ranked[0] && ranked[0].confidence || 0;
            const status = top >= 0.5 ? 'READY_FOR_ACTION' : 'MORE_OBSERVATION';
            return { ranked_causes: ranked, status };
        }

        function runT5(t4Output, t1Output) {
            if (!t1Output) return null;
            var kb = T16_KB_BY_EVENT[t1Output.event_id];
            if (!kb) return null;
            var defCards = (kb.action_cards_by_cause._default || []).slice(0, 3);
            if (!t4Output || t4Output.status === 'ESCALATE') {
                return { action_cards: defCards, escalation_option: kb.escalation_option };
            }
            const topCause = t4Output.ranked_causes && t4Output.ranked_causes[0] && t4Output.ranked_causes[0].cause_id;
            const cards = kb.action_cards_by_cause[topCause] || kb.action_cards_by_cause._default;
            const list = (Array.isArray(cards) ? cards : [cards]).slice(0, 3);
            return { action_cards: list, escalation_option: kb.escalation_option };
        }

        function runT6(resolved, actionId, t5Output, t1Output) {
            var event_id = (t1Output && t1Output.event_id) ? t1Output.event_id : 'DOOR_NOT_OPEN';
            if (resolved === true) {
                if (event_id === 'DOOR_NOT_OPEN') {
                    if (actionId === 'A_DOOR_005') {
                        return { resolved: true, next_step: 'done_with_next_steps', next_steps_guidance: [{ id: 'battery_replace_guide', label: 'そのキーの電池交換のガイド', type: 'guide' }, { id: 'dealer_inspection', label: '販売店での点検', type: 'guide' }], spare_key_worked: true };
                    }
                    var isImmediateOnly = actionId === 'A_DOOR_001' || actionId === 'A_DOOR_004';
                    if (isImmediateOnly) {
                        return { resolved: true, next_step: 'done_with_next_steps', next_steps_guidance: [{ id: 'engine_start_guide', label: 'エンジンのかけ方', type: 'guide' }, { id: 'battery_replace_guide', label: '電池交換のガイド', type: 'guide' }] };
                    }
                }
                return { resolved: true, next_step: 'done' };
            }
            if (event_id === 'DOOR_NOT_OPEN') {
                if (actionId === 'A_DOOR_001') {
                    return { resolved: false, next_step: 'retry_with_t4', evidence_from_failure: { action_id: 'A_DOOR_001', action_result: 'failed', summary: '機械キーで解錠を試したが開かなかった' } };
                }
                if (actionId === 'A_DOOR_004') {
                    return { resolved: false, next_step: 'retry_with_t4', evidence_from_failure: { action_id: 'A_DOOR_004', action_result: 'failed', summary: 'キーをドアハンドルに近づけて再試行したが開かなかった' } };
                }
                if (actionId === 'A_DOOR_005') {
                    return { resolved: false, next_step: 'retry_with_t4', evidence_from_failure: { action_id: 'A_DOOR_005', action_result: 'failed', summary: '予備キーでも開かなかった' } };
                }
            }
            return { resolved: false, next_step: 'escalate', handoff_payload: { event_id: event_id, actions_tried: [actionId || '不明'], result_summary: '試したが改善しなかった。' } };
        }

        function startT16Flow(userMessage) {
            const msg = (userMessage || '').trim();
            if (!msg) return;
            addTheme001Message('user', msg);

            const t1 = runT1(msg);
            if (!t1) return;
            T16State.t1Output = t1;
            T16State.t2Output = runT2(t1);
            var t2 = T16State.t2Output;
            var skipT3 = t2 && t2.cause_candidates && t2.cause_candidates.length === 1 && t1.confidence >= T3_SKIP_CONFIDENCE_THRESHOLD;

            if (skipT3) {
                T16State.t3Output = null;
                T16State.observationResult = null;
                T16State.t4Output = runT4(null, t2, null, undefined, t1);
                T16State.t5Output = runT5(T16State.t4Output, t1);
                T16State.step = 't5_actions';
                var cards = T16State.t5Output.action_cards || [];
                var card0 = cards[0];
                if (card0) {
                    var stepsHtml = '<strong>' + (card0.title || '') + '</strong><br><br>';
                    if (card0.steps && card0.steps.length) {
                        stepsHtml += '<strong>手順：</strong><br>';
                        card0.steps.forEach(function(s, i) { stepsHtml += (i + 1) + '. ' + s + '<br>'; });
                    }
                    if (card0.duration) stepsHtml += '<br>⏱ ' + card0.duration + '<br>';
                    if (card0.required_items && card0.required_items.length) stepsHtml += '必要物: ' + card0.required_items.join(', ') + '<br>';
                    if (card0.risk_notice) stepsHtml += '<br>⚠️ ' + card0.risk_notice + '<br>';
                    if (card0.alternative) stepsHtml += '<br>うまくいかない場合: ' + card0.alternative + '<br>';
                    stepsHtml += '<br>試した結果を教えてください：<br>' +
                        '<div class="quick-reply-container">' +
                        '<div class="quick-reply" onclick="handleT16T6Result(true)">✅ <span>うまくいった</span></div>' +
                        '<div class="quick-reply" onclick="handleT16T6Result(false)">❌ <span>うまくいかなかった</span></div>' +
                        '</div>';
                    if (cards.length > 1) {
                        stepsHtml += '<br><details style="margin-top:10px;"><summary style="cursor:pointer; font-size:0.9em; color:#aaa;">その他の選択肢</summary>';
                        cards.slice(1).forEach(function(c) {
                            stepsHtml += '<div class="card" style="margin:6px 0; cursor:pointer; padding:8px;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' + (c.title || '') + '</div>';
                        });
                        stepsHtml += '</details>';
                    }
                    if (T16State.t5Output.escalation_option) {
                        stepsHtml += '<div style="margin-top: 10px; font-size: 0.9em; color: #aaa;">販売店・ロードサービスも選択できます</div>';
                    }
                    addTheme001Message('ai', stepsHtml);
                } else {
                    var introHtml = '次の対処をご案内します。<br><br>';
                    cards.forEach(function(c) {
                        introHtml += '<div class="card" style="margin-bottom: 10px; cursor: pointer;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' +
                            '<div class="card-title">' + (c.title || '') + '</div></div>';
                    });
                    addTheme001Message('ai', introHtml);
                }
                return;
            }

            T16State.t3Output = runT3(t2, t1);
            T16State.step = 't3_question';
            const q = T16State.t3Output;
            if (t1.event_id === 'WARNING_LIGHT' && q.answer_type === 'single_choice' && q.options_ref) {
                var kb = T16_KB_BY_EVENT.WARNING_LIGHT;
                var opts = kb[q.options_ref] || [];
                var gridHtml = '<strong>確認</strong><br><br>' + (q.question_text || '') + '<br><br>' +
                    '<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">';
                opts.forEach(function(o) {
                    var iconUrl = (typeof WARNING_LIGHT_ICONS !== 'undefined' && WARNING_LIGHT_ICONS[o.icon]) ? WARNING_LIGHT_ICONS[o.icon] : '';
                    gridHtml += '<div class="card" style="cursor:pointer; margin-bottom:0; padding:10px; text-align:center;" onclick="handleT16T3Answer(\'' + (o.option_id || '') + '\')">' +
                        (iconUrl ? '<img src="' + iconUrl + '" alt="" style="width:48px; height:48px; margin:0 auto 6px; display:block;">' : '') +
                        '<span style="font-size:0.85em; color:#e0e0e0;">' + (o.label || o.option_id) + '</span></div>';
                });
                gridHtml += '</div>';
                addTheme001Message('ai', gridHtml);
                return;
            }
            var labelYes = (q && q.label_yes) ? q.label_yes : 'はい';
            var labelNo = (q && q.label_no) ? q.label_no : 'いいえ';
            const questionHtml = '<strong>確認</strong><br><br>' +
                (q.question_text || '') + '<br><br>' +
                '<div class="quick-reply-container">' +
                '<div class="quick-reply" onclick="handleT16T3Answer(\'yes\')">💡 <span>' + labelYes + '</span></div>' +
                '<div class="quick-reply" onclick="handleT16T3Answer(\'no\')">🔴 <span>' + labelNo + '</span></div>' +
                '</div>';
            addTheme001Message('ai', questionHtml);
        }

        function handleT16T3Answer(answerYesNo, optionLabel) {
            var label;
            if (optionLabel != null) label = optionLabel;
            else if (T16State.t1Output && T16State.t1Output.event_id === 'WARNING_LIGHT' && answerYesNo !== 'yes' && answerYesNo !== 'no') {
                var kb = T16_KB_BY_EVENT.WARNING_LIGHT;
                var opts = kb.warning_light_options || [];
                var sel = opts.find(function(o) { return o.option_id === answerYesNo; });
                label = sel ? sel.label : answerYesNo;
            } else label = answerYesNo === 'yes' ? 'はい、点きます' : 'いいえ、点きません';
            addTheme001Message('user', label);

            T16State.observationResult = answerYesNo;
            T16State.t4Output = runT4(answerYesNo, T16State.t2Output, T16State.t3Output, undefined, T16State.t1Output);
            T16State.t5Output = runT5(T16State.t4Output, T16State.t1Output);
            var topCause = T16State.t4Output.ranked_causes && T16State.t4Output.ranked_causes[0] && T16State.t4Output.ranked_causes[0].cause_id;

            if (T16State.t1Output && T16State.t1Output.event_id === 'WARNING_LIGHT' && topCause === 'BRAKE_SYSTEM') {
                T16State.step = 'brake_urgent_done';
                var brakeHtml = '<strong style="color:#ff6b6b;">⚠️ ブレーキ警告灯が点灯しています</strong><br><br>' +
                    'ただちに安全な場所に停車し、エンジンを止めてください。<br>ブレーキ系統の警告のため、走行を続けると危険です。<br><br>' +
                    '停車後は、このままスタッフが引き継ぎます。';
                addTheme001Message('ai', brakeHtml);
                return;
            }

            T16State.step = 't5_actions';
            const cards = T16State.t5Output.action_cards || [];
            var card0 = cards[0];
            if (card0) {
                var stepsHtml = '<strong>' + (card0.title || '') + '</strong><br><br>';
                if (card0.steps && card0.steps.length) {
                    stepsHtml += '<strong>手順：</strong><br>';
                    card0.steps.forEach(function(s, i) { stepsHtml += (i + 1) + '. ' + s + '<br>'; });
                }
                if (card0.duration) stepsHtml += '<br>⏱ ' + card0.duration + '<br>';
                if (card0.required_items && card0.required_items.length) stepsHtml += '必要物: ' + card0.required_items.join(', ') + '<br>';
                if (card0.risk_notice) stepsHtml += '<br>⚠️ ' + card0.risk_notice + '<br>';
                if (card0.alternative) stepsHtml += '<br>うまくいかない場合: ' + card0.alternative + '<br>';
                stepsHtml += '<br>試した結果を教えてください：<br>' +
                    '<div class="quick-reply-container">' +
                    '<div class="quick-reply" onclick="handleT16T6Result(true)">✅ <span>うまくいった</span></div>' +
                    '<div class="quick-reply" onclick="handleT16T6Result(false)">❌ <span>うまくいかなかった</span></div>' +
                    '</div>';
                if (cards.length > 1) {
                    stepsHtml += '<br><details style="margin-top:10px;"><summary style="cursor:pointer; font-size:0.9em; color:#aaa;">その他の選択肢</summary>';
                    cards.slice(1).forEach(function(c) {
                        stepsHtml += '<div class="card" style="margin:6px 0; cursor:pointer; padding:8px;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' + (c.title || '') + '</div>';
                    });
                    stepsHtml += '</details>';
                }
                if (T16State.t1Output && T16State.t1Output.event_id === 'BLUETOOTH') {
                    stepsHtml += '<div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">' +
                        '<div class="button" style="cursor: pointer; padding: 10px 14px; font-size: 0.9em;" onclick="showBluetoothStepGuide()">📋 ステップバイステップガイドを見る</div>' +
                        '<div class="button" style="cursor: pointer; padding: 10px 14px; font-size: 0.9em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" onclick="showBluetoothVideo()">📋 動画で見る</div>' +
                        '</div>';
                }
                if (T16State.t5Output.escalation_option) {
                    stepsHtml += '<div style="margin-top: 10px; font-size: 0.9em; color: #aaa;">販売店・ロードサービスも選択できます</div>';
                }
                addTheme001Message('ai', stepsHtml);
            } else {
                var fallbackHtml = '';
                cards.forEach(function(c) {
                    fallbackHtml += '<div class="card" style="margin-bottom: 10px; cursor: pointer;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' +
                        '<div class="card-title">' + (c.title || '') + '</div></div>';
                });
                addTheme001Message('ai', fallbackHtml);
            }
        }

        function handleT16ActionClick(actionId) {
            T16State.lastActionId = actionId;
            const cards = (T16State.t5Output && T16State.t5Output.action_cards) || [];
            const card = cards.find(function(c) { return c.action_id === actionId; });
            if (!card) return;
            addTheme001Message('user', card.title || actionId);

            if (actionId === 'A_DOOR_002' && card.risk_notice) {
                T16State.step = 'battery_replace_choice';
                var choiceHtml = '<strong>' + (card.title || '電池交換') + '</strong><br><br>';
                choiceHtml += '⚠️ ' + card.risk_notice + '<br><br>';
                choiceHtml += 'どちらで対応しますか？<br>' +
                    '<div class="quick-reply-container">' +
                    '<div class="quick-reply" onclick="handleT16BatteryReplaceChoice(\'dealer\')">🏢 <span>販売店で交換する</span></div>' +
                    '<div class="quick-reply" onclick="handleT16BatteryReplaceChoice(\'self\')">🔧 <span>自分で交換する</span></div>' +
                    '</div>';
                addTheme001Message('ai', choiceHtml);
                return;
            }

            T16State.step = 't6_wait_result';
            var stepsHtml = '<strong>' + (card.title || '') + '</strong><br><br>';
            if (card.steps && card.steps.length) {
                stepsHtml += '<strong>手順：</strong><br>';
                card.steps.forEach(function(s, i) { stepsHtml += (i + 1) + '. ' + s + '<br>'; });
            }
            if (card.required_items && card.required_items.length) stepsHtml += '<br>必要物: ' + card.required_items.join(', ') + '<br>';
            if (card.risk_notice) stepsHtml += '<br>⚠️ ' + card.risk_notice + '<br>';
            if (card.alternative) stepsHtml += '<br>うまくいかない場合: ' + card.alternative + '<br>';
            var resultPrompt = actionId === 'A_DOOR_005' ? '予備キーで試した結果を教えてください：' : '試した結果を教えてください：';
            stepsHtml += '<br>' + resultPrompt + '<br>' +
                '<div class="quick-reply-container">' +
                '<div class="quick-reply" onclick="handleT16T6Result(true)">✅ <span>うまくいった</span></div>' +
                '<div class="quick-reply" onclick="handleT16T6Result(false)">❌ <span>うまくいかなかった</span></div>' +
                '</div>';
            if (T16State.t1Output && T16State.t1Output.event_id === 'BLUETOOTH') {
                stepsHtml += '<div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">' +
                    '<div class="button" style="cursor: pointer; padding: 10px 14px; font-size: 0.9em;" onclick="showBluetoothStepGuide()">📋 ステップバイステップガイドを見る</div>' +
                    '<div class="button" style="cursor: pointer; padding: 10px 14px; font-size: 0.9em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);" onclick="showBluetoothVideo()">🎥 動画で見る</div>' +
                    '</div>';
            }
            addTheme001Message('ai', stepsHtml);
        }

        function handleT16BatteryReplaceChoice(choice) {
            if (choice === 'dealer') {
                addTheme001Message('user', '販売店で交換する');
                addTheme001Message('ai', '<strong>販売店での電池交換</strong><br><br>' +
                    'ご来店での電池交換は、スタッフが予約・ご案内を承ります。<br><br>' +
                    '他にご質問はありますか？');
                T16State.step = null;
                return;
            }
            addTheme001Message('user', '自分で交換する');
            T16State.step = 't6_wait_result';
            var card = (T16State.t5Output && T16State.t5Output.action_cards || []).find(function(c) { return c.action_id === 'A_DOOR_002'; });
            if (!card) card = { title: '恒久対応：電池交換', steps: ['CR2032（またはCR2450）を用意', 'キーを開けて電池を交換', '動作確認'], required_items: ['CR2032 または CR2450（ボタン電池）'], risk_notice: '部品破損の恐れがあるため、慎重に作業してください。', alternative: '電池購入先の案内へ' };
            var stepsHtml = '<strong>自分で電池交換をする場合</strong><br><br>';
            stepsHtml += '<strong>手順：</strong><br>';
            (card.steps || []).forEach(function(s, i) { stepsHtml += (i + 1) + '. ' + s + '<br>'; });
            if (card.required_items && card.required_items.length) stepsHtml += '<br>必要物: ' + card.required_items.join(', ') + '<br>';
            if (card.risk_notice) stepsHtml += '<br>⚠️ ' + card.risk_notice + '<br>';
            if (card.alternative) stepsHtml += '<br>うまくいかない場合: ' + card.alternative + '<br>';
            stepsHtml += '<br>電池交換後、スマートキーが正常に動作するようになりましたか？<br>' +
                '<div class="quick-reply-container">' +
                '<div class="quick-reply" onclick="handleT16T6Result(true)">✅ <span>うまくいった</span></div>' +
                '<div class="quick-reply" onclick="handleT16T6Result(false)">❌ <span>うまくいかなかった</span></div>' +
                '</div>';
            addTheme001Message('ai', stepsHtml);
        }

        function handleT16T6Result(resolved) {
            const label = resolved ? 'うまくいった' : 'うまくいかなかった';
            addTheme001Message('user', label);
            const t6 = runT6(resolved, T16State.lastActionId, T16State.t5Output, T16State.t1Output);

            if (t6.next_step === 'retry_with_t4') {
                T16State.t4Output = runT4(T16State.observationResult, T16State.t2Output, T16State.t3Output, t6.evidence_from_failure, T16State.t1Output);
                T16State.t5Output = runT5(T16State.t4Output, T16State.t1Output);
                T16State.step = 't5_actions';
                var cards = T16State.t5Output.action_cards || [];
                var card0 = cards[0];
                if (card0) {
                    var stepsHtml = '<strong>' + (card0.title || '') + '</strong><br><br>';
                    if (card0.steps && card0.steps.length) {
                        stepsHtml += '<strong>手順：</strong><br>';
                        card0.steps.forEach(function(s, i) { stepsHtml += (i + 1) + '. ' + s + '<br>'; });
                    }
                    if (card0.duration) stepsHtml += '<br>⏱ ' + card0.duration + '<br>';
                    if (card0.required_items && card0.required_items.length) stepsHtml += '必要物: ' + card0.required_items.join(', ') + '<br>';
                    if (card0.risk_notice) stepsHtml += '<br>⚠️ ' + card0.risk_notice + '<br>';
                    if (card0.alternative) stepsHtml += '<br>うまくいかない場合: ' + card0.alternative + '<br>';
                    stepsHtml += '<br>試した結果を教えてください：<br>' +
                        '<div class="quick-reply-container">' +
                        '<div class="quick-reply" onclick="handleT16T6Result(true)">✅ <span>うまくいった</span></div>' +
                        '<div class="quick-reply" onclick="handleT16T6Result(false)">❌ <span>うまくいかなかった</span></div>' +
                        '</div>';
                    if (cards.length > 1) {
                        stepsHtml += '<br><details style="margin-top:10px;"><summary style="cursor:pointer; font-size:0.9em; color:#aaa;">その他の選択肢</summary>';
                        cards.slice(1).forEach(function(c) {
                            stepsHtml += '<div class="card" style="margin:6px 0; cursor:pointer; padding:8px;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' + (c.title || '') + '</div>';
                        });
                        stepsHtml += '</details>';
                    }
                    if (T16State.t5Output.escalation_option) {
                        stepsHtml += '<div style="margin-top: 10px; font-size: 0.9em; color: #aaa;">販売店・ロードサービスも選択できます</div>';
                    }
                    addTheme001Message('ai', stepsHtml);
                } else {
                    var aiHtml = '別の対処をご案内します。<br><br>';
                    cards.forEach(function(c) {
                        aiHtml += '<div class="card" style="margin-bottom: 10px; cursor: pointer;" onclick="handleT16ActionClick(\'' + (c.action_id || '') + '\')">' +
                            '<div class="card-title">' + (c.title || '') + '</div></div>';
                    });
                    addTheme001Message('ai', aiHtml);
                }
                return;
            }

            var aiHtml = '';
            if (t6.next_step === 'done') {
                aiHtml = '<strong>よかったです。解決しました。</strong><br><br>また困ったことがあればお知らせください。';
            } else if (t6.next_step === 'done_with_next_steps') {
                if (T16State.t1Output && T16State.t1Output.event_id === 'DOOR_NOT_OPEN' && (T16State.lastActionId === 'A_DOOR_005' || t6.spare_key_worked)) {
                    aiHtml = '<strong>予備キーで開けられてよかったです。</strong><br><br>今お使いのキー側の不調の可能性があります。そのキーの電池交換や販売店での点検をご案内します。<br><br>';
                } else if (T16State.t1Output && T16State.t1Output.event_id === 'DOOR_NOT_OPEN') {
                    aiHtml = '<strong>ドアを開けられてよかったです。</strong><br><br>次に、電池交換をしておくとスマートキーで開けられるようになります。<br><br>';
                } else {
                    aiHtml = '<strong>よかったです。解決しました。</strong><br><br>';
                }
                if (t6.next_steps_guidance && t6.next_steps_guidance.length) {
                    t6.next_steps_guidance.forEach(function(g) { aiHtml += '・' + (g.label || g.id) + '<br>'; });
                }
            } else if (t6.next_step === 'escalate') {
                aiHtml = '<strong>ご案内</strong><br><br>試していただいた内容をまとめました。このままスタッフが引き継ぎます。';
            } else {
                aiHtml = '次の対応をご案内します。';
            }
            addTheme001Message('ai', aiHtml);
            T16State.step = null;
        }

        // Bluetoothステップバイステップガイド（モーダル用）
        var currentBluetoothStep = 1;
        var totalBluetoothSteps = 5;
        var bluetoothStepsData = [
            { title: '設定画面を開く', content: 'ディスプレイのホーム画面から「⚙️ 設定」アイコンをタップします。<br><br>または、ステアリングホイールの「MENU」ボタンを長押ししても設定画面が開きます。' },
            { title: 'Bluetoothメニューを選択', content: '• 設定メニューから「📡 Bluetooth」を選択<br>• Bluetoothがオフの場合は「オンにする」をタップ<br>• 画面に「検索中...」と表示されます' },
            { title: 'スマートフォンを検出可能にする', content: '<strong>📱 iPhoneの場合：</strong><br>• 「設定」→「Bluetooth」を開く<br>• Bluetoothをオンにすると自動的に検出可能になります<br><br><strong>📱 Androidの場合：</strong><br>• 「設定」→「接続済みのデバイス」→「Bluetooth」を開く<br>• 「新しいデバイスとペア設定する」をタップ' },
            { title: 'デバイスを選択してペアリング', content: '• 車のディスプレイに表示された「利用可能なデバイス」リストから、あなたのスマートフォン名を探してタップ<br><br>• 車とスマートフォンの両方に同じPINコードが表示されます<br><br>• <strong style="color: #BF00FF;">PINコードが一致していることを確認</strong>してください' },
            { title: 'ペアリングを承認', content: '• 車のディスプレイで「ペアリング」または「接続」をタップ<br><br>• スマートフォンに表示される「ペアリング」確認ダイアログで「ペアリング」をタップ<br><br>• 「✅ 接続しました」というメッセージが表示されたら完了！' }
        ];

        function showBluetoothStepGuide() {
            currentBluetoothStep = 1;
            var modal = document.getElementById('bluetoothStepGuideModal');
            if (modal) { modal.style.display = 'block'; renderBluetoothStepModal(); }
        }

        function closeBluetoothStepGuide() {
            var modal = document.getElementById('bluetoothStepGuideModal');
            if (modal) modal.style.display = 'none';
        }

        function renderBluetoothStepModal() {
            var container = document.getElementById('bluetoothStepGuideContent');
            if (!container) return;
            var step = bluetoothStepsData[currentBluetoothStep - 1];
            var nextBtn = currentBluetoothStep < totalBluetoothSteps
                ? '<button class="button" onclick="nextBluetoothStep()" style="flex: 2; background: linear-gradient(135deg, #BF00FF 0%, #D200FF 100%);">次へ →</button>'
                : '<button class="button" onclick="completeBluetoothGuide()" style="flex: 2; background: linear-gradient(135deg, #00d084 0%, #00b96d 100%);">✓ 完了</button>';
            var prevBtn = currentBluetoothStep > 1 ? '<button class="button" onclick="previousBluetoothStep()" style="flex: 1; background: #444;">← 前へ</button>' : '';
            container.innerHTML = '<div style="color: #BF00FF; font-weight: 600; margin-bottom: 10px;">ステップ ' + currentBluetoothStep + '/' + totalBluetoothSteps + '</div>' +
                '<div class="card" style="margin-bottom: 15px;"><div class="card-title">' + (step.title || '') + '</div><div class="card-content" style="line-height: 1.7;">' + (step.content || '') + '</div></div>' +
                '<div style="display: flex; gap: 10px; margin-bottom: 15px;">' + prevBtn + nextBtn + '</div>' +
                '<button class="button" onclick="closeBluetoothStepGuide()" style="background: #555; width: 100%;">閉じる</button>';
        }

        function nextBluetoothStep() {
            if (currentBluetoothStep < totalBluetoothSteps) { currentBluetoothStep++; renderBluetoothStepModal(); }
        }

        function previousBluetoothStep() {
            if (currentBluetoothStep > 1) { currentBluetoothStep--; renderBluetoothStepModal(); }
        }

        function completeBluetoothGuide() {
            var container = document.getElementById('bluetoothStepGuideContent');
            if (!container) return;
            container.innerHTML = '<div class="card" style="text-align: center; border: 2px solid #00d084;"><div class="card-content" style="padding: 30px 20px;">' +
                '<div style="font-size: 3em; margin-bottom: 15px;">🎉</div>' +
                '<div style="font-size: 1.3em; font-weight: bold; color: #00d084; margin-bottom: 10px;">Bluetooth接続完了！</div>' +
                '<div style="color: #aaa; font-size: 0.95em; line-height: 1.7;">次回からは、エンジンをかけると自動的に接続されます。</div>' +
                '<button class="button" onclick="closeBluetoothStepGuide()" style="margin-top: 20px; background: linear-gradient(135deg, #BF00FF 0%, #D200FF 100%);">閉じる</button></div></div>';
        }

        function showBluetoothVideo() {
            addTheme001Message('user', '動画で見る');
            addTheme001Message('ai', '<strong>🎥 動画で見る</strong><br><br>Bluetooth接続の手順動画は準備中です。<br>しばらくお待ちください。または「ステップバイステップガイドを見る」で手順を確認できます。');
        }

        function addTheme001Message(sender, html) {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${sender}`;

            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${sender}`;
            bubble.innerHTML = html;

            messageDiv.appendChild(bubble);
            chatMessages.appendChild(messageDiv);

            // スクロールを最下部に
            const homeContent = getScrollEl();
            if (homeContent) {
                homeContent.scrollTop = homeContent.scrollHeight;
            }
        }

        // THEME-001 用チャット: 初期メッセージ（T1-T6 駆動に統一）
        function initTheme001Chat() {
            const chatMessages = document.getElementById('chatMessages');
            if (!chatMessages) return;
            chatMessages.innerHTML = '';

            addTheme001Message('ai', `お客様のご質問や状況を入力するか、下のメニューから選択してください。<br><br>
よくある事象から選べます：
<div class="quick-reply-container">
  <div class="quick-reply" onclick="startT16Flow('スマートキーでドアが開かない')">
    🔑 <span>スマートキーでドアが開かない</span>
  </div>
  <div class="quick-reply" onclick="startT16Flow('キー電池切れの表示が出ている')">
    🔋 <span>キー電池切れの表示が出ている</span>
  </div>
  <div class="quick-reply" onclick="startT16Flow('警告灯が点灯')">
    ⚠️ <span>警告灯が点灯</span>
  </div>
  <div class="quick-reply" onclick="startT16Flow('Bluetooth接続ができない')">
    📱 <span>Bluetooth接続ができない</span>
  </div>
</div>`);
        }

        // THEME-001: 状況別の簡易ガイド
        function handleTheme001Situation(type) {
            if (type === 'battery') {
                addTheme001Message('user', 'インジケーターが光らない / 反応が弱い');
                addTheme001Message('ai', `<strong>電池切れの可能性が高いです</strong><br><br>
まずはドアを開けるために、スマートキーに内蔵されている「機械キー」を使うことができます。<br><br>
<strong>今すぐできること：</strong><br>
・スマートキー側面のボタンを押して、機械キーを取り出す<br>
・運転席ドアの鍵穴に差し込んで回すと、ドアを開けられます<br><br>
<strong>次に、どうしたいですか？</strong><br><br>
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001BatteryChoice('mechanical')">
    🔑 <span>まずは機械キーで開ける</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001BatteryChoice('replace')">
    🔋 <span>電池交換したい</span>
  </div>
</div>`);
            } else if (type === 'interference') {
                addTheme001Message('user', 'インジケーターは光るが、クルマが反応しない');
                addTheme001Message('ai', `<strong>電波干渉の可能性があります</strong><br><br>
次のような場所では、周囲の強い電波の影響でスマートキーが反応しにくくなることがあります。<br>
・空港や放送局、携帯電話基地局の近く<br>
・大きな送電線・変電施設の近く など<br><br>
<strong>対処のポイント：</strong><br>
1. スマートキーをドアハンドルにできるだけ近づけて操作してみる<br>
2. 可能であれば、数メートルだけ場所を移動して再度試す<br>
3. それでもダメな場合は、機械キーでドアを開けて一時的に利用する<br><br>
※ 詳しい電波干渉ガイド（GUIDE-008）は、別画面で参照できるようにする想定です。<br><br>
試してみた結果に近いものを教えてください：
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001InterferenceResult('resolved')">
    ✅ <span>試したら正常に開くようになった</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001InterferenceResult('still_bad')">
    ❌ <span>試しても改善しない / 不安が残る</span>
  </div>
</div>`);
            } else {
                addTheme001Message('user', 'よく分からない / 確認が難しい');
                addTheme001Message('ai', `<strong>ありがとうございます。では、より安全側でご案内します。</strong><br><br>
・まずは機械キーでドアを開けられるか確認しましょう。<br>
・そのうえで、スマートキーの電池交換か、販売店での点検をおすすめします。<br><br>
このチャットでは流れのイメージを確認し、実際の詳細手順や販売店検索は、<br>
「DIGITAL OM」の本番画面でAPI連携して実現する想定です。`);
            }
        }

        // THEME-001: 電池切れ時の選択（機械キー or 電池交換）
        function handleTheme001BatteryChoice(choice) {
            if (choice === 'mechanical') {
                addTheme001Message('user', 'まずは機械キーで開ける');
                addTheme001Message('ai', `<strong>機械キーで開錠を試してみましょう</strong><br><br>
<strong>機械キーの取り出し方：</strong><br>
1. スマートキー側面のボタンを押します<br>
2. 機械キーが取り出せます<br><br>
<strong>開錠方法：</strong><br>
1. 運転席ドアの鍵穴に機械キーを差し込みます<br>
2. 回すとドアを開けられます<br><br>
機械キーで開錠できましたか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001MechanicalResult('opened')">
    ✅ <span>開いた！</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001MechanicalResult('not_opened')">
    ❌ <span>開かなかった</span>
  </div>
</div>`);
            } else if (choice === 'replace') {
                addTheme001Message('user', '電池交換したい');
                addTheme001Message('ai', `<strong>電池交換について</strong><br><br>
電池はご自身で交換できますが、部品が破損するおそれがあるので、<br>
トヨタ販売店で交換することをおすすめします。<br><br>
どちらで対応したいですか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001ReplaceChoice('self')">
    🔧 <span>自分で交換したい</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001ReplaceChoice('dealer')">
    🏢 <span>販売店で交換したい</span>
  </div>
</div>`);
            }
        }

        // THEME-001: 機械キー開錠結果
        function handleTheme001MechanicalResult(result) {
            if (result === 'opened') {
                addTheme001Message('user', '開いた！');
                addTheme001Message('ai', `<strong>よかったです！ドアを開けることができました。</strong><br><br>
次に、スマートキーの電池交換をしておくと、次回からはスマートキーで開けられるようになります。<br><br>
電池交換は、ご自身で交換するか、販売店で交換するかを選べます。<br>
どちらにしますか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001ReplaceChoice('self')">
    🔧 <span>自分で交換したい</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001ReplaceChoice('dealer')">
    🏢 <span>販売店で交換したい</span>
  </div>
</div>`);
            } else {
                addTheme001Message('user', '開かなかった');
                addTheme001Message('ai', `<strong>機械キーでも開かない場合は、ドアロックの故障の可能性があります。</strong><br><br>
この場合はスタッフが引き継ぎます。`);
            }
        }

        // THEME-001: 電池交換の選択（自分で or 販売店）
        function handleTheme001ReplaceChoice(choice) {
            if (choice === 'self') {
                addTheme001Message('user', '自分で交換したい');
                addTheme001Message('ai', `<strong>自分で電池交換をする場合</strong><br><br>
<strong>事前に準備するもの：</strong><br>
・マイナスドライバー<br>
・小さいマイナスドライバー<br>
・リチウム電池：CR2450<br><br>
<strong>⚠️ 注意：</strong><br>
部品が破損するおそれがあるので、慎重に作業してください。<br>
不安な場合は、販売店で交換することをおすすめします。<br><br>
準備物は揃っていますか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001PreparationCheck('ready')">
    ✅ <span>揃っている</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001PreparationCheck('not_ready')">
    ❌ <span>揃っていない（特に電池）</span>
  </div>
</div>`);
            } else if (choice === 'dealer') {
                addTheme001Message('user', '販売店で交換したい');
                addTheme001Message('ai', `<strong>販売店での電池交換</strong><br><br>
ご来店での電池交換は、スタッフが予約・ご案内を承ります。<br><br>
他にご質問はありますか？`);
            }
        }

        // THEME-001: 準備物の確認
        function handleTheme001PreparationCheck(status) {
            if (status === 'ready') {
                addTheme001Message('user', '揃っている');
                addTheme001Message('ai', `<strong>それでは、電池交換を実施しましょう</strong><br><br>
<strong>電池交換手順：</strong><br><br>
<strong>ステップ 1: スマートキーのカバーを外す</strong><br>
・小さいマイナスドライバーを使って、カバーを慎重に外します<br>
・力を入れすぎると破損するおそれがあります<br><br>
<strong>ステップ 2: 古い電池を取り出す</strong><br>
・マイナスドライバーで電池を外します<br>
・電池の向きを確認してください（+/-の向き）<br><br>
<strong>ステップ 3: 新しい電池を取り付ける</strong><br>
・CR2450電池を正しい向きで取り付けます<br>
・カバーを元に戻します<br><br>
<strong>ステップ 4: 動作確認</strong><br>
・スマートキーのボタンを押して、インジケーターが光るか確認します<br><br>
電池交換後、スマートキーが正常に動作するようになりましたか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001ReplaceResult('solved')">
    ✅ <span>正常に動作するようになった</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001ReplaceResult('not_solved')">
    ❌ <span>まだ動作しない</span>
  </div>
</div>`);
            } else if (status === 'not_ready') {
                addTheme001Message('user', '揃っていない（特に電池）');
                addTheme001Message('ai', `<strong>電池の購入方法をご案内します</strong><br><br>
<strong>リチウム電池CR2450の入手先：</strong><br><br>
<strong>1. オンライン購入</strong><br>
・Amazon: <a href="https://amazon.co.jp/s?k=CR2450" target="_blank" style="color: #BF00FF;">CR2450を検索</a><br>
・楽天市場: <a href="https://search.rakuten.co.jp/search/mall/CR2450/" target="_blank" style="color: #BF00FF;">CR2450を検索</a><br>
・価格目安: ¥200-500<br><br>
<strong>2. 店舗購入</strong><br>
・トヨタ販売店<br>
・時計店<br>
・カメラ店<br>
・家電量販店（電池コーナー）<br><br>
<strong>3. 近くの店舗を探す</strong><br>
※ 実際の画面では、位置情報に基づいて最寄りの店舗を検索できます。<br><br>
電池を入手できましたか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001BatteryPurchase('purchased')">
    ✅ <span>入手した</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001BatteryPurchase('not_purchased')">
    ❌ <span>入手できない / 販売店で交換したい</span>
  </div>
</div>`);
            }
        }

        // THEME-001: 電池購入結果
        function handleTheme001BatteryPurchase(result) {
            if (result === 'purchased') {
                addTheme001Message('user', '入手した');
                addTheme001Message('ai', `<strong>それでは、電池交換を実施しましょう</strong><br><br>
<strong>電池交換手順：</strong><br><br>
<strong>ステップ 1: スマートキーのカバーを外す</strong><br>
・小さいマイナスドライバーを使って、カバーを慎重に外します<br>
・力を入れすぎると破損するおそれがあります<br><br>
<strong>ステップ 2: 古い電池を取り出す</strong><br>
・マイナスドライバーで電池を外します<br>
・電池の向きを確認してください（+/-の向き）<br><br>
<strong>ステップ 3: 新しい電池を取り付ける</strong><br>
・CR2450電池を正しい向きで取り付けます<br>
・カバーを元に戻します<br><br>
<strong>ステップ 4: 動作確認</strong><br>
・スマートキーのボタンを押して、インジケーターが光るか確認します<br><br>
電池交換後、スマートキーが正常に動作するようになりましたか？
<div class="quick-reply-container">
  <div class="quick-reply" onclick="handleTheme001ReplaceResult('solved')">
    ✅ <span>正常に動作するようになった</span>
  </div>
  <div class="quick-reply" onclick="handleTheme001ReplaceResult('not_solved')">
    ❌ <span>まだ動作しない</span>
  </div>
</div>`);
            } else if (result === 'not_purchased') {
                addTheme001Message('user', '入手できない / 販売店で交換したい');
                addTheme001Message('ai', `<strong>販売店での電池交換</strong><br><br>
ご来店での電池交換は、スタッフが予約・ご案内を承ります。<br><br>
他にご質問はありますか？`);
            }
        }

        // THEME-001: 電池交換結果
        function handleTheme001ReplaceResult(result) {
            if (result === 'solved') {
                addTheme001Message('user', '正常に動作するようになった');
                addTheme001Message('ai', `<strong>🎉 問題が解決しました！</strong><br><br>
スマートキーが正常に動作するようになりました。<br><br>
<strong>今後の予防策：</strong><br>
・電池の寿命は約1-2年です<br>
・インジケーターが光らない場合は、早めに電池交換を検討してください<br>
・予備の電池を常備しておくと安心です<br><br>
他にご質問はありますか？`);
            } else if (result === 'not_solved') {
                addTheme001Message('user', 'まだ動作しない');
                addTheme001Message('ai', `<strong>電池交換でも解決しない場合</strong><br><br>
電池交換をしても動作しない場合は、以下の可能性があります：<br><br>
<strong>1. 車両のバッテリー上がり</strong><br>
・車の電装品（ライト、エアコンなど）は動作しますか？<br>
・動作しない場合は、バッテリー上がりの可能性があります<br><br>
<strong>2. スマートキー本体の故障</strong><br>
・予備のスマートキーでも同じ症状ですか？<br>
・予備キーで動作する場合は、元のキーの故障の可能性があります<br><br>
<strong>3. 車両側の故障</strong><br>
・販売店での点検をおすすめします<br><br>
点検のご案内はスタッフが承ります。`);
            }
        }

        // THEME-001: 電波干渉後の分岐
        function handleTheme001InterferenceResult(result) {
            if (result === 'resolved') {
                addTheme001Message('user', '試したら正常に開くようになった');
                addTheme001Message('ai', `<strong>よかったです！問題は解消したようです。</strong><br><br>
今回のような場所では、一時的にスマートキーが反応しにくくなることがありますが、<br>
車両やキーそのものの故障ではないケースがほとんどです。<br><br>
念のため、今後同じような場所で同じ現象が繰り返される場合は、<br>
販売店での点検もご検討ください。<br><br>
他にも気になっていることがあれば、入力してみてください。`);
            } else {
                addTheme001Message('user', '試しても改善しない / 不安が残る');
                addTheme001Message('ai', `<strong>改善しない場合は、スマートキー本体や車両側の不具合の可能性もあります。</strong><br><br>
安全のため、販売店での点検をご案内します。点検の手配はスタッフが承ります。`);
            }
        }

        // チャットメッセージを送信
        function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const messageText = input.value.trim();
            
            if (!messageText) return;
            try { recordOemQuestion(messageText, 'staff'); } catch (e) {}
            
            const chatMessages = document.getElementById('chatMessages');
            input.value = '';
            if (input.style) input.style.height = 'auto';
            
            var scrollToBottom = function() {
                var el = getScrollEl();
                if (el) el.scrollTop = el.scrollHeight;
            };
            
            if (runT1(messageText)) {
                startT16Flow(messageText);
                setTimeout(scrollToBottom, 100);
                return;
            }
            
            var userMessage = document.createElement('div');
            userMessage.className = 'chat-message user';
            userMessage.innerHTML = '<div class="chat-bubble user">' + messageText.replace(/\n/g, '<br>') + '</div>';
            chatMessages.appendChild(userMessage);
            setTimeout(scrollToBottom, 100);
            
            setTimeout(function() {
                var aiMessage = document.createElement('div');
                aiMessage.className = 'chat-message ai';
                aiMessage.innerHTML = '<div class="chat-bubble ai"><strong>追加の情報をご案内します</strong><br><br>' + generateChatResponse(messageText) + '</div>';
                chatMessages.appendChild(aiMessage);
                setTimeout(scrollToBottom, 100);
            }, 1000);
        }

        // チャット応答を生成（デモ用）
        function generateChatResponse(question) {
            const lowerQuestion = question.toLowerCase();
            
            if (lowerQuestion.includes('フィルター') || lowerQuestion.includes('交換')) {
                return `
                    エアコンフィルターの交換手順をご案内します：<br><br>
                    <strong>必要なもの：</strong><br>
                    • 新しいエアコンフィルター<br>
                    • 清潔な布（あれば）<br><br>
                    <strong>交換手順：</strong><br>
                    1. グローブボックスを開けます<br>
                    2. フィルターカバーを外します<br>
                    3. 古いフィルターを取り出します<br>
                    4. 新しいフィルターを取り付けます<br><br>
                    詳しい手順は「エアコンフィルターの清掃方法」をご覧ください。
                `;
            } else if (lowerQuestion.includes('設定') || lowerQuestion.includes('温度')) {
                return `
                    エアコンの温度設定についてご案内します：<br><br>
                    <strong>推奨設定：</strong><br>
                    • 冷房時：18-22℃<br>
                    • 暖房時：22-25℃<br><br>
                    <strong>設定方法：</strong><br>
                    1. エアコンパネルの「温度」ボタンを押す<br>
                    2. +/- ボタンで温度を調整<br>
                    3. 風量は「中」以上を推奨<br><br>
                    適切な温度設定で快適にお過ごしください。
                `;
            } else if (lowerQuestion.includes('販売店') || lowerQuestion.includes('連絡')) {
                return `
                    販売店のご案内はスタッフが承ります。
                `;
            } else {
                return `
                    ご質問ありがとうございます。<br><br>
                    「${question}」について確認しています。<br><br>
                    より詳しい情報が必要な場合は、以下のオプションをお試しください：<br>
                    • 検索バーで具体的なキーワードを入力<br>
                    • 販売店にお問い合わせ<br>
                    • 取扱説明書の該当ページを確認<br><br>
                    他にお困りのことはありますか？
                `;
            }
        }
