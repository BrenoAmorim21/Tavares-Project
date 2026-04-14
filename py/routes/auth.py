# WorkFinder — py/routes/auth.py

from flask import Blueprint, request, jsonify, g
import bcrypt
import jwt
import datetime
from config import Config
from db import get_conn, query_one
from decorators import login_required

auth_bp = Blueprint('auth', __name__)


def gerar_token(user_id, tipo):
    payload = {
        'sub':  user_id,
        'tipo': tipo,
        'exp':  datetime.datetime.utcnow() + datetime.timedelta(days=Config.JWT_EXPIRY_DAYS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')


# ── CADASTRO ──────────────────────────────────────────────

@auth_bp.route('/cadastro', methods=['POST'])
def cadastro():
    dados = request.get_json(silent=True) or {}
    tipo  = dados.get('tipo', '').strip()
    email = dados.get('email', '').strip().lower()
    senha = dados.get('senha', '').strip()

    if not tipo or not email or not senha:
        return jsonify({'mensagem': 'Campos obrigatórios faltando.'}), 400
    if tipo not in ('empresa', 'freelancer'):
        return jsonify({'mensagem': 'Tipo inválido.'}), 400
    if len(senha) < 8:
        return jsonify({'mensagem': 'Senha deve ter pelo menos 8 caracteres.'}), 400

    senha_hash = bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()

    conn = get_conn()
    cur  = conn.cursor(dictionary=True)
    try:
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            return jsonify({'mensagem': 'Este e-mail já está cadastrado.'}), 409

        cur.execute(
            'INSERT INTO users (email, senha_hash, tipo) VALUES (%s, %s, %s)',
            (email, senha_hash, tipo)
        )
        user_id = cur.lastrowid

        if tipo == 'empresa':
            cur.execute(
                '''INSERT INTO companies
                   (user_id, nome_empresa, cnpj, setor, tamanho, descricao, cidade, estado)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
                (user_id,
                 dados.get('nome_empresa', ''),
                 dados.get('cnpj'),
                 dados.get('setor'),
                 dados.get('tamanho'),
                 dados.get('descricao'),
                 dados.get('cidade'),
                 dados.get('estado'))
            )
            nome = dados.get('nome_empresa', 'Empresa')
            perfil_id = cur.lastrowid
        else:
            cur.execute(
                '''INSERT INTO freelancers
                   (user_id, nome, cpf, area, experiencia, habilidades, portfolio_url, cidade, estado)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
                (user_id,
                 dados.get('nome', ''),
                 dados.get('cpf'),
                 dados.get('area'),
                 dados.get('experiencia'),
                 dados.get('habilidades'),
                 dados.get('portfolio'),
                 dados.get('cidade'),
                 dados.get('estado'))
            )
            nome = dados.get('nome', 'Freelancer')
            perfil_id = cur.lastrowid

        conn.commit()
        token = gerar_token(user_id, tipo)
        return jsonify({'token': token, 'tipo': tipo, 'nome': nome, 'id': user_id, 'perfil_id': perfil_id}), 201

    except Exception as e:
        conn.rollback()
        print(f'[ERRO cadastro] {e}')
        return jsonify({'mensagem': 'Erro interno. Tente novamente.'}), 500
    finally:
        cur.close()
        conn.close()


# ── LOGIN ─────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    dados = request.get_json(silent=True) or {}
    email = dados.get('email', '').strip().lower()
    senha = dados.get('senha', '')

    if not email or not senha:
        return jsonify({'mensagem': 'E-mail e senha são obrigatórios.'}), 400

    conn = get_conn()
    cur  = conn.cursor(dictionary=True)
    try:
        cur.execute('SELECT * FROM users WHERE email = %s AND ativo = 1', (email,))
        user = cur.fetchone()

        if not user or not bcrypt.checkpw(senha.encode(), user['senha_hash'].encode()):
            return jsonify({'mensagem': 'E-mail ou senha incorretos.'}), 401

        tipo = user['tipo']
        if tipo == 'empresa':
            cur.execute(
                'SELECT id AS perfil_id, nome_empresa AS nome FROM companies WHERE user_id = %s',
                (user['id'],)
            )
        else:
            cur.execute(
                'SELECT id AS perfil_id, nome FROM freelancers WHERE user_id = %s',
                (user['id'],)
            )

        perfil = cur.fetchone() or {}
        token  = gerar_token(user['id'], tipo)

        return jsonify({
            'token':     token,
            'tipo':      tipo,
            'nome':      perfil.get('nome', email),
            'id':        user['id'],
            'perfil_id': perfil.get('perfil_id'),
        }), 200

    except Exception as e:
        print(f'[ERRO login] {e}')
        return jsonify({'mensagem': 'Erro interno. Tente novamente.'}), 500
    finally:
        cur.close()
        conn.close()


# ── ME ────────────────────────────────────────────────────

@auth_bp.route('/me', methods=['GET'])
@login_required
def me():
    user = query_one('SELECT id, email, tipo, criado_em FROM users WHERE id = %s', (g.user_id,))
    if not user:
        return jsonify({'mensagem': 'Usuário não encontrado.'}), 404
    user['criado_em'] = str(user['criado_em'])
    return jsonify(user), 200