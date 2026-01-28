# -*- coding: utf-8 -*-
"""
API設定ファイル
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """基本設定"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///guide_system.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')
    
    # Google Places API
    GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')
    
    # 検索設定
    DEFAULT_SEARCH_RADIUS_KM = 5
    MAX_SEARCH_RADIUS_KM = 50
    DEFAULT_RESULT_LIMIT = 10
    MAX_RESULT_LIMIT = 50
    
    # 店舗タイプ
    STORE_TYPES = [
        'トヨタ販売店',
        '時計店',
        'カメラ店',
        '家電量販店',
        'コンビニエンスストア'
    ]
    
    # 電池タイプ
    BATTERY_TYPES = {
        'CR2450': {
            'voltage': '3V',
            'type': 'リチウムコイン電池',
            'price_range': '¥200-500'
        }
    }


class DevelopmentConfig(Config):
    """開発環境設定"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """本番環境設定"""
    DEBUG = False
    TESTING = False
    
    # 本番環境では環境変数必須
    SECRET_KEY = os.getenv('SECRET_KEY')
    GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')


class TestingConfig(Config):
    """テスト環境設定"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# 環境に応じた設定を選択
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
