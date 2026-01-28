# -*- coding: utf-8 -*-
"""
データベース初期化スクリプト
"""

from app import create_app, db
from models import Store, BatteryInventory, Dealer, Reservation
import json
from pathlib import Path


def init_database():
    """データベースを初期化"""
    app = create_app('development')
    
    with app.app_context():
        # テーブル作成
        print('Creating tables...')
        db.create_all()
        print('✅ Tables created')
        
        # サンプルデータ投入
        load_sample_data()
        
        print('\n✅ Database initialized successfully!')


def load_sample_data():
    """サンプルデータを投入"""
    
    # 既存データをクリア
    print('\nClearing existing data...')
    Store.query.delete()
    Dealer.query.delete()
    db.session.commit()
    
    # 店舗データ投入
    print('Loading store data...')
    stores_data = get_sample_stores()
    for store_data in stores_data:
        store = Store(**store_data)
        db.session.add(store)
    db.session.commit()
    print(f'✅ Loaded {len(stores_data)} stores')
    
    # 販売店データ投入
    print('Loading dealer data...')
    dealers_data = get_sample_dealers()
    for dealer_data in dealers_data:
        dealer = Dealer(**dealer_data)
        db.session.add(dealer)
    db.session.commit()
    print(f'✅ Loaded {len(dealers_data)} dealers')


def get_sample_stores():
    """サンプル店舗データ"""
    return [
        {
            'name': 'ヨドバシカメラ 新宿西口本店',
            'store_type': '家電量販店',
            'latitude': 35.6917,
            'longitude': 139.6990,
            'address': '東京都新宿区西新宿1-11-1',
            'phone': '03-3346-1010',
            'website': 'https://www.yodobashi.com/',
            'business_hours': {
                'weekday': '9:30-22:00',
                'saturday': '9:30-22:00',
                'sunday': '9:30-22:00'
            },
            'has_cr2450': True,
            'availability': '高'
        },
        {
            'name': 'ビックカメラ 渋谷東口店',
            'store_type': '家電量販店',
            'latitude': 35.6584,
            'longitude': 139.7016,
            'address': '東京都渋谷区渋谷1-24-12',
            'phone': '03-5466-1111',
            'website': 'https://www.biccamera.com/',
            'business_hours': {
                'weekday': '10:00-21:00',
                'saturday': '10:00-21:00',
                'sunday': '10:00-21:00'
            },
            'has_cr2450': True,
            'availability': '高'
        },
        {
            'name': 'セイコーウォッチサロン 銀座',
            'store_type': '時計店',
            'latitude': 35.6712,
            'longitude': 139.7640,
            'address': '東京都中央区銀座4-5-11',
            'phone': '03-3563-1111',
            'business_hours': {
                'weekday': '11:00-19:30',
                'saturday': '11:00-19:30',
                'sunday': '11:00-19:00'
            },
            'has_cr2450': True,
            'availability': '高'
        },
        {
            'name': 'カメラのキタムラ 池袋東口店',
            'store_type': 'カメラ店',
            'latitude': 35.7295,
            'longitude': 139.7124,
            'address': '東京都豊島区南池袋1-25-9',
            'phone': '03-5957-3911',
            'business_hours': {
                'weekday': '10:00-20:00',
                'saturday': '10:00-20:00',
                'sunday': '10:00-20:00'
            },
            'has_cr2450': True,
            'availability': '中'
        }
    ]


def get_sample_dealers():
    """サンプル販売店データ"""
    return [
        {
            'dealer_id': 'DEALER-001',
            'name': 'トヨタ東京カローラ 新宿店',
            'latitude': 35.6915,
            'longitude': 139.6938,
            'address': '東京都新宿区西新宿7-10-1',
            'prefecture': '東京都',
            'city': '新宿区',
            'phone': '03-3363-5111',
            'website': 'https://www.tokyo-corolla.co.jp/',
            'email': 'shinjuku@tokyo-corolla.co.jp',
            'business_hours': {
                'showroom': {
                    'weekday': '9:30-19:00',
                    'saturday': '9:30-19:00',
                    'sunday': '9:30-19:00'
                },
                'service': {
                    'weekday': '9:00-18:00',
                    'saturday': '9:00-17:00',
                    'sunday': '定休日'
                }
            },
            'regular_holidays': ['日曜日（サービス）'],
            'services': ['電池交換', 'キー修理', '点検', '車検', '一般整備'],
            'online_reservation_url': 'https://www.tokyo-corolla.co.jp/reserve',
            'accepts_walkin': True
        },
        {
            'dealer_id': 'DEALER-002',
            'name': 'トヨタカローラ東京 渋谷店',
            'latitude': 35.6595,
            'longitude': 139.7004,
            'address': '東京都渋谷区桜丘町1-1',
            'prefecture': '東京都',
            'city': '渋谷区',
            'phone': '03-3463-5111',
            'website': 'https://www.corolla-tokyo.jp/',
            'email': 'shibuya@corolla-tokyo.jp',
            'business_hours': {
                'showroom': {
                    'weekday': '9:30-19:00',
                    'saturday': '9:30-19:00',
                    'sunday': '9:30-19:00'
                },
                'service': {
                    'weekday': '9:00-18:00',
                    'saturday': '9:00-17:00',
                    'sunday': '9:00-17:00'
                }
            },
            'regular_holidays': [],
            'services': ['電池交換', 'キー修理', '点検', '車検'],
            'online_reservation_url': 'https://www.corolla-tokyo.jp/reserve',
            'accepts_walkin': True
        },
        {
            'dealer_id': 'DEALER-003',
            'name': 'ネッツトヨタ東京 池袋店',
            'latitude': 35.7308,
            'longitude': 139.7092,
            'address': '東京都豊島区東池袋1-10-1',
            'prefecture': '東京都',
            'city': '豊島区',
            'phone': '03-5391-1111',
            'website': 'https://www.netz-tokyo.jp/',
            'business_hours': {
                'showroom': {
                    'weekday': '10:00-19:00',
                    'saturday': '10:00-19:00',
                    'sunday': '10:00-19:00'
                },
                'service': {
                    'weekday': '10:00-18:00',
                    'saturday': '10:00-18:00',
                    'sunday': '10:00-18:00'
                }
            },
            'regular_holidays': ['月曜日'],
            'services': ['電池交換', '点検', '車検', '一般整備'],
            'accepts_walkin': True
        }
    ]


if __name__ == '__main__':
    init_database()
