# -*- coding: utf-8 -*-
"""
近隣店舗検索APIルート
"""

from flask import Blueprint, request, jsonify
from services.nearby_stores import NearbyStoresService

stores_bp = Blueprint('stores', __name__)
service = NearbyStoresService()


@stores_bp.route('/nearby-stores', methods=['POST'])
def search_nearby_stores():
    """
    近隣店舗検索API
    
    Request Body:
    {
        "location": {"latitude": 35.681236, "longitude": 139.767125},
        "item": "CR2450",
        "radius_km": 5,
        "store_types": ["トヨタ販売店", "時計店"]
    }
    
    Response:
    {
        "stores": [...],
        "count": 10,
        "search_params": {...}
    }
    """
    
    try:
        data = request.get_json()
        
        # 必須パラメータチェック
        if not data or 'location' not in data:
            return jsonify({
                'error': 'Bad Request',
                'message': 'location is required'
            }), 400
        
        location = data['location']
        if 'latitude' not in location or 'longitude' not in location:
            return jsonify({
                'error': 'Bad Request',
                'message': 'latitude and longitude are required'
            }), 400
        
        # パラメータ取得
        item = data.get('item', 'CR2450')
        radius_km = data.get('radius_km', 5)
        store_types = data.get('store_types', None)
        limit = data.get('limit', 10)
        
        # 検索実行
        result = service.search_nearby_stores(
            latitude=location['latitude'],
            longitude=location['longitude'],
            item=item,
            radius_km=radius_km,
            store_types=store_types,
            limit=limit
        )
        
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({
            'error': 'Bad Request',
            'message': str(e)
        }), 400
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500


@stores_bp.route('/stores/<int:store_id>', methods=['GET'])
def get_store(store_id):
    """
    店舗詳細取得API
    
    Parameters:
    - store_id: 店舗ID
    
    Response:
    {
        "store": {...}
    }
    """
    
    try:
        store = service.get_store_by_id(store_id)
        
        if not store:
            return jsonify({
                'error': 'Not Found',
                'message': f'Store {store_id} not found'
            }), 404
        
        return jsonify({'store': store}), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500


@stores_bp.route('/battery-info', methods=['GET'])
def get_battery_info():
    """
    電池情報取得API
    
    Query Parameters:
    - battery_type: 電池タイプ（デフォルト: CR2450）
    
    Response:
    {
        "battery_type": "CR2450",
        "specifications": {...},
        "purchase_tips": [...]
    }
    """
    
    try:
        battery_type = request.args.get('battery_type', 'CR2450')
        info = service.get_battery_info(battery_type)
        
        return jsonify(info), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500
