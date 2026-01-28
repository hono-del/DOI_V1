# -*- coding: utf-8 -*-
"""
近隣店舗検索サービス
"""

from models.store import Store, BatteryInventory
from app import db
from config import Config
import googlemaps


class NearbyStoresService:
    """近隣店舗検索サービスクラス"""
    
    def __init__(self):
        self.config = Config()
        self.gmaps = None
        if self.config.GOOGLE_PLACES_API_KEY:
            self.gmaps = googlemaps.Client(key=self.config.GOOGLE_PLACES_API_KEY)
    
    def search_nearby_stores(self, latitude, longitude, item='CR2450', 
                           radius_km=5, store_types=None, limit=10):
        """
        近隣店舗を検索
        
        Args:
            latitude: 緯度
            longitude: 経度
            item: 商品（電池タイプ）
            radius_km: 検索半径（km）
            store_types: 店舗タイプのリスト
            limit: 結果の最大数
        
        Returns:
            dict: 検索結果
        """
        
        # パラメータ検証
        if radius_km > self.config.MAX_SEARCH_RADIUS_KM:
            radius_km = self.config.MAX_SEARCH_RADIUS_KM
        
        if limit > self.config.MAX_RESULT_LIMIT:
            limit = self.config.MAX_RESULT_LIMIT
        
        # データベースから検索
        query = Store.query.filter(
            Store.has_cr2450 == True
        )
        
        # 店舗タイプでフィルタ
        if store_types:
            query = query.filter(Store.store_type.in_(store_types))
        
        all_stores = query.all()
        
        # 距離計算とフィルタリング
        stores_with_distance = []
        for store in all_stores:
            distance = store.calculate_distance(latitude, longitude)
            if distance <= radius_km:
                store_dict = store.to_dict()
                store_dict['distance_km'] = distance
                stores_with_distance.append(store_dict)
        
        # 距離順にソート
        stores_with_distance.sort(key=lambda x: x['distance_km'])
        
        # 制限適用
        stores_with_distance = stores_with_distance[:limit]
        
        # Google Places APIで追加検索（オプション）
        if self.gmaps and len(stores_with_distance) < limit:
            google_stores = self._search_google_places(
                latitude, longitude, radius_km, store_types
            )
            stores_with_distance.extend(google_stores)
            stores_with_distance = stores_with_distance[:limit]
        
        return {
            'stores': stores_with_distance,
            'count': len(stores_with_distance),
            'search_params': {
                'location': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'item': item,
                'radius_km': radius_km,
                'store_types': store_types or 'all',
                'limit': limit
            }
        }
    
    def _search_google_places(self, latitude, longitude, radius_km, store_types):
        """Google Places APIで検索"""
        if not self.gmaps:
            return []
        
        results = []
        radius_m = radius_km * 1000
        
        # 店舗タイプごとに検索
        search_types = store_types or ['electronics_store', 'jewelry_store']
        
        for store_type in search_types:
            try:
                places_result = self.gmaps.places_nearby(
                    location=(latitude, longitude),
                    radius=radius_m,
                    type=store_type,
                    language='ja'
                )
                
                for place in places_result.get('results', [])[:5]:
                    store_info = {
                        'name': place['name'],
                        'store_type': store_type,
                        'location': {
                            'latitude': place['geometry']['location']['lat'],
                            'longitude': place['geometry']['location']['lng'],
                            'address': place.get('vicinity', '')
                        },
                        'contact': {
                            'phone': None,
                            'website': None
                        },
                        'battery_availability': {
                            'has_cr2450': False,
                            'availability': '要確認'
                        },
                        'distance_km': self._calculate_distance(
                            latitude, longitude,
                            place['geometry']['location']['lat'],
                            place['geometry']['location']['lng']
                        ),
                        'source': 'google_places'
                    }
                    results.append(store_info)
            
            except Exception as e:
                print(f"Google Places API error: {e}")
                continue
        
        return results
    
    def _calculate_distance(self, lat1, lng1, lat2, lng2):
        """2点間の距離を計算"""
        from math import radians, cos, sin, sqrt, atan2
        
        R = 6371
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return round(R * c, 2)
    
    def get_store_by_id(self, store_id):
        """店舗詳細を取得"""
        store = Store.query.get(store_id)
        if store:
            return store.to_dict()
        return None
    
    def get_battery_info(self, battery_type='CR2450'):
        """電池情報を取得"""
        battery_info = self.config.BATTERY_TYPES.get(battery_type, {})
        
        return {
            'battery_type': battery_type,
            'specifications': battery_info,
            'purchase_tips': [
                'オンライン購入の場合、到着まで機械キーをご使用ください',
                '店舗購入の場合、在庫確認のため事前に電話連絡をおすすめします',
                '複数個セット購入で予備を確保しておくと安心です',
                '電池の使用期限（約5-7年）を確認して購入しましょう'
            ],
            'online_stores': [
                {
                    'name': 'Amazon',
                    'url': f'https://amazon.co.jp/s?k={battery_type}',
                    'price_range': battery_info.get('price_range', '¥200-500'),
                    'delivery': '最短翌日配送'
                },
                {
                    'name': '楽天市場',
                    'url': f'https://search.rakuten.co.jp/search?k={battery_type}',
                    'price_range': battery_info.get('price_range', '¥200-500'),
                    'delivery': '2-3日'
                }
            ]
        }
