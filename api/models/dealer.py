# -*- coding: utf-8 -*-
"""
販売店モデル
"""

from app import db
from datetime import datetime


class Dealer(db.Model):
    """トヨタ販売店マスター"""
    
    __tablename__ = 'dealers'
    
    id = db.Column(db.Integer, primary_key=True)
    dealer_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    
    # 位置情報
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(300))
    prefecture = db.Column(db.String(20))
    city = db.Column(db.String(50))
    
    # 連絡先
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    email = db.Column(db.String(100))
    
    # 営業時間
    business_hours = db.Column(db.JSON)
    # {
    #   'showroom': {'weekday': '9:30-19:00', ...},
    #   'service': {'weekday': '9:00-18:00', ...}
    # }
    
    # 定休日
    regular_holidays = db.Column(db.JSON)  # ['月曜日', '第2火曜日']
    
    # サービス
    services = db.Column(db.JSON)  # ['電池交換', 'キー修理', '点検']
    
    # 予約
    online_reservation_url = db.Column(db.String(200))
    accepts_walkin = db.Column(db.Boolean, default=True)
    
    # メタデータ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_distance=False, user_location=None):
        """辞書形式に変換"""
        result = {
            'dealer_id': self.dealer_id,
            'name': self.name,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'address': self.address,
                'prefecture': self.prefecture,
                'city': self.city
            },
            'contact': {
                'phone': self.phone,
                'website': self.website,
                'email': self.email
            },
            'business_hours': self.business_hours,
            'regular_holidays': self.regular_holidays,
            'services': self.services,
            'reservation': {
                'online_url': self.online_reservation_url,
                'accepts_walkin': self.accepts_walkin
            }
        }
        
        if include_distance and user_location:
            distance = self.calculate_distance(
                user_location['latitude'],
                user_location['longitude']
            )
            result['distance_km'] = distance
        
        return result
    
    def calculate_distance(self, lat, lng):
        """2点間の距離を計算（ヒュベニの公式）"""
        from math import radians, cos, sin, sqrt, atan2
        
        R = 6371  # 地球の半径（km）
        
        lat1 = radians(self.latitude)
        lon1 = radians(self.longitude)
        lat2 = radians(lat)
        lon2 = radians(lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c
        return round(distance, 2)


class Reservation(db.Model):
    """予約情報"""
    
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.String(50), unique=True, nullable=False)
    dealer_id = db.Column(db.Integer, db.ForeignKey('dealers.id'), nullable=False)
    
    # 予約内容
    service_type = db.Column(db.String(50), nullable=False)  # 'key_battery'
    preferred_date = db.Column(db.Date, nullable=False)
    preferred_time = db.Column(db.String(10))  # '10:00'
    
    # 顧客情報
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(100))
    vehicle_model = db.Column(db.String(100))
    
    # ステータス
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled
    notes = db.Column(db.Text)
    
    # メタデータ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーション
    dealer = db.relationship('Dealer', backref='reservations')
    
    def to_dict(self):
        return {
            'reservation_id': self.reservation_id,
            'dealer': {
                'dealer_id': self.dealer.dealer_id,
                'name': self.dealer.name,
                'phone': self.dealer.phone
            },
            'service_type': self.service_type,
            'appointment': {
                'date': self.preferred_date.isoformat(),
                'time': self.preferred_time
            },
            'customer': {
                'name': self.customer_name,
                'phone': self.customer_phone,
                'email': self.customer_email,
                'vehicle': self.vehicle_model
            },
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
