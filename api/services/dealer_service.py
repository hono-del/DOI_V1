# -*- coding: utf-8 -*-
"""
販売店サービス
"""

from models.dealer import Dealer, Reservation
from app import db
from config import Config
from datetime import datetime
import uuid


class DealerService:
    """販売店サービスクラス"""
    
    def __init__(self):
        self.config = Config()
    
    def search_dealers(self, latitude, longitude, service_type='all',
                      radius_km=20, limit=10):
        """
        販売店を検索
        
        Args:
            latitude: 緯度
            longitude: 経度
            service_type: サービスタイプ
            radius_km: 検索半径（km）
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
        query = Dealer.query
        
        # サービスタイプでフィルタ
        if service_type != 'all':
            query = query.filter(
                Dealer.services.contains([service_type])
            )
        
        all_dealers = query.all()
        
        # 距離計算とフィルタリング
        dealers_with_distance = []
        for dealer in all_dealers:
            distance = dealer.calculate_distance(latitude, longitude)
            if distance <= radius_km:
                dealer_dict = dealer.to_dict(
                    include_distance=True,
                    user_location={'latitude': latitude, 'longitude': longitude}
                )
                dealers_with_distance.append(dealer_dict)
        
        # 距離順にソート
        dealers_with_distance.sort(key=lambda x: x['distance_km'])
        
        # 制限適用
        dealers_with_distance = dealers_with_distance[:limit]
        
        return {
            'dealers': dealers_with_distance,
            'count': len(dealers_with_distance),
            'search_params': {
                'location': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'service_type': service_type,
                'radius_km': radius_km,
                'limit': limit
            }
        }
    
    def get_dealer_by_id(self, dealer_id):
        """販売店詳細を取得"""
        dealer = Dealer.query.filter_by(dealer_id=dealer_id).first()
        if dealer:
            return dealer.to_dict()
        return None
    
    def create_reservation(self, dealer_id, service_type, preferred_date,
                          preferred_time, customer_name, customer_phone,
                          customer_email=None, vehicle_model=None, notes=None):
        """
        予約を作成
        
        Args:
            dealer_id: 販売店ID
            service_type: サービスタイプ
            preferred_date: 希望日（YYYY-MM-DD）
            preferred_time: 希望時刻（HH:MM）
            customer_name: 顧客名
            customer_phone: 電話番号
            customer_email: メールアドレス（オプション）
            vehicle_model: 車両モデル（オプション）
            notes: 備考（オプション）
        
        Returns:
            dict: 予約情報
        """
        
        # 販売店の存在確認
        dealer = Dealer.query.filter_by(dealer_id=dealer_id).first()
        if not dealer:
            raise ValueError(f'Dealer {dealer_id} not found')
        
        # サービスタイプの確認
        if service_type not in dealer.services:
            raise ValueError(f'Service {service_type} is not available at this dealer')
        
        # 日付の検証
        try:
            reservation_date = datetime.strptime(preferred_date, '%Y-%m-%d').date()
            if reservation_date < datetime.now().date():
                raise ValueError('Preferred date must be in the future')
        except ValueError as e:
            raise ValueError(f'Invalid date format: {e}')
        
        # 予約ID生成
        reservation_id = f'RES-{uuid.uuid4().hex[:8].upper()}'
        
        # 予約作成
        reservation = Reservation(
            reservation_id=reservation_id,
            dealer_id=dealer.id,
            service_type=service_type,
            preferred_date=reservation_date,
            preferred_time=preferred_time,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            vehicle_model=vehicle_model,
            status='pending',
            notes=notes
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return reservation.to_dict()
    
    def get_reservation(self, reservation_id):
        """予約詳細を取得"""
        reservation = Reservation.query.filter_by(
            reservation_id=reservation_id
        ).first()
        
        if reservation:
            return reservation.to_dict()
        return None
    
    def cancel_reservation(self, reservation_id):
        """予約をキャンセル"""
        reservation = Reservation.query.filter_by(
            reservation_id=reservation_id
        ).first()
        
        if not reservation:
            return False
        
        reservation.status = 'cancelled'
        db.session.commit()
        
        return True
    
    def update_reservation_status(self, reservation_id, status):
        """予約ステータスを更新"""
        reservation = Reservation.query.filter_by(
            reservation_id=reservation_id
        ).first()
        
        if not reservation:
            return False
        
        valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if status not in valid_statuses:
            raise ValueError(f'Invalid status: {status}')
        
        reservation.status = status
        db.session.commit()
        
        return True
