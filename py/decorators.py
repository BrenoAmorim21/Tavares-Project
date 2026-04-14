# WorkFinder — py/decorators.py
# Centraliza o decorator login_required para evitar import circular

import jwt
from flask import request, jsonify, g
from functools import wraps
from config import Config


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'mensagem': 'Token não fornecido.'}), 401
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            g.user_id   = payload['sub']
            g.user_tipo = payload['tipo']
        except jwt.ExpiredSignatureError:
            return jsonify({'mensagem': 'Token expirado. Faça login novamente.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'mensagem': 'Token inválido.'}), 401
        return f(*args, **kwargs)
    return decorated