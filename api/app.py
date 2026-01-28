# -*- coding: utf-8 -*-
"""
ガイドシステム API
Flask Application
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import config
import os

# データベース初期化
db = SQLAlchemy()


def create_app(config_name=None):
    """Flaskアプリケーション作成"""
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 拡張機能の初期化
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Blueprintの登録
    from routes.stores import stores_bp
    from routes.dealers import dealers_bp
    
    app.register_blueprint(stores_bp, url_prefix='/api')
    app.register_blueprint(dealers_bp, url_prefix='/api/dealers')
    
    # ルートエンドポイント
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Guide System API',
            'version': '1.0.0',
            'status': 'running'
        })
    
    # ヘルスチェック
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        })
    
    # エラーハンドラー
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An internal error occurred'
        }), 500
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
