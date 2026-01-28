# -*- coding: utf-8 -*-
"""
店舗モデル
"""

from app import db
from datetime import datetime


class Store(db.Model):
    """店舗マスター"""
    
    __tablename__ = 'stores'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    store_type = db.Column(db.String(50), nullable=False)
    
    # 位置情報
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(300))
    
    # 連絡先
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    
    # 営業時間
    business_hours = db.Column(db.JSON)  # {'weekday': '9:00-18:00', ...}
    
    # 在庫情報
    has_cr2450 = db.Column(db.Boolean, default=False)
    availability = db.Column(db.String(20))  # '高', '中', '低', '要確認'
    
    # メタデータ
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'name': self.name,
            'store_type': self.store_type,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'address': self.address
            },
            'contact': {
                'phone': self.phone,
                'website': self.website
            },
            'business_hours': self.business_hours,
            'battery_availability': {
                'has_cr2450': self.has_cr2450,
                'availability': self.availability
            }
        }
    
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


class BatteryInventory(db.Model):
    """電池在庫情報"""
    
    __tablename__ = 'battery_inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    battery_type = db.Column(db.String(20), nullable=False)
    
    # 在庫情報
    in_stock = db.Column(db.Boolean, default=False)
    quantity = db.Column(db.Integer)
    price = db.Column(db.Integer)  # 円
    
    # 更新情報
    last_checked = db.Column(db.DateTime, default=datetime.utcnow)
    
    # リレーション
    store = db.relationship('Store', backref='inventory')
    
    def to_dict(self):
        return {
            'battery_type': self.battery_type,
            'in_stock': self.in_stock,
            'quantity': self.quantity,
            'price': self.price,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None
        }
