# -*- coding: utf-8 -*-
"""
販売店APIルート
"""

from flask import Blueprint, request, jsonify
from services.dealer_service import DealerService

dealers_bp = Blueprint('dealers', __name__)
service = DealerService()


@dealers_bp.route('/search', methods=['POST'])
def search_dealers():
    """
    販売店検索API
    
    Request Body:
    {
        "location": {"latitude": 35.681236, "longitude": 139.767125},
        "service_type": "key_battery",
        "radius_km": 20
    }
    
    Response:
    {
        "dealers": [...],
        "count": 5,
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
        service_type = data.get('service_type', 'all')
        radius_km = data.get('radius_km', 20)
        limit = data.get('limit', 10)
        
        # 検索実行
        result = service.search_dealers(
            latitude=location['latitude'],
            longitude=location['longitude'],
            service_type=service_type,
            radius_km=radius_km,
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


@dealers_bp.route('/<dealer_id>', methods=['GET'])
def get_dealer(dealer_id):
    """
    販売店詳細取得API
    
    Parameters:
    - dealer_id: 販売店ID
    
    Response:
    {
        "dealer": {...}
    }
    """
    
    try:
        dealer = service.get_dealer_by_id(dealer_id)
        
        if not dealer:
            return jsonify({
                'error': 'Not Found',
                'message': f'Dealer {dealer_id} not found'
            }), 404
        
        return jsonify({'dealer': dealer}), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500


@dealers_bp.route('/reserve', methods=['POST'])
def create_reservation():
    """
    予約作成API
    
    Request Body:
    {
        "dealer_id": "DEALER-001",
        "service_type": "key_battery",
        "preferred_date": "2026-02-01",
        "preferred_time": "10:00",
        "customer": {
            "name": "山田太郎",
            "phone": "090-1234-5678",
            "email": "yamada@example.com",
            "vehicle": "AQUA 2024"
        },
        "notes": "電池交換希望"
    }
    
    Response:
    {
        "reservation": {...},
        "message": "予約が完了しました"
    }
    """
    
    try:
        data = request.get_json()
        
        # 必須パラメータチェック
        required_fields = ['dealer_id', 'service_type', 'preferred_date', 'customer']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': 'Bad Request',
                    'message': f'{field} is required'
                }), 400
        
        customer = data['customer']
        required_customer_fields = ['name', 'phone']
        for field in required_customer_fields:
            if field not in customer:
                return jsonify({
                    'error': 'Bad Request',
                    'message': f'customer.{field} is required'
                }), 400
        
        # 予約作成
        reservation = service.create_reservation(
            dealer_id=data['dealer_id'],
            service_type=data['service_type'],
            preferred_date=data['preferred_date'],
            preferred_time=data.get('preferred_time'),
            customer_name=customer['name'],
            customer_phone=customer['phone'],
            customer_email=customer.get('email'),
            vehicle_model=customer.get('vehicle'),
            notes=data.get('notes')
        )
        
        return jsonify({
            'reservation': reservation,
            'message': '予約が完了しました'
        }), 201
    
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


@dealers_bp.route('/reservations/<reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    """
    予約詳細取得API
    
    Parameters:
    - reservation_id: 予約ID
    
    Response:
    {
        "reservation": {...}
    }
    """
    
    try:
        reservation = service.get_reservation(reservation_id)
        
        if not reservation:
            return jsonify({
                'error': 'Not Found',
                'message': f'Reservation {reservation_id} not found'
            }), 404
        
        return jsonify({'reservation': reservation}), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500


@dealers_bp.route('/reservations/<reservation_id>', methods=['DELETE'])
def cancel_reservation(reservation_id):
    """
    予約キャンセルAPI
    
    Parameters:
    - reservation_id: 予約ID
    
    Response:
    {
        "message": "予約をキャンセルしました"
    }
    """
    
    try:
        success = service.cancel_reservation(reservation_id)
        
        if not success:
            return jsonify({
                'error': 'Not Found',
                'message': f'Reservation {reservation_id} not found'
            }), 404
        
        return jsonify({
            'message': '予約をキャンセルしました'
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': 'Internal Server Error',
            'message': str(e)
        }), 500
