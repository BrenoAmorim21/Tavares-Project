# WorkFinder — py/routes/jobs.py

from flask import Blueprint, request, jsonify, g
import jwt
from functools import wraps
from config import Config
from db import get_conn, query_one, query_all

jobs_bp = Blueprint('jobs', __name__)


# ── decorator local para não depender de routes.auth ──────
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
            return jsonify({'mensagem': 'Token expirado.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'mensagem': 'Token inválido.'}), 401
        return f(*args, **kwargs)
    return decorated


def _serializar(row):
    for k in ('criado_em', 'atualizado_em', 'prazo', 'deadline'):
        if k in row and row[k]:
            row[k] = str(row[k])
    return row


def _get_company_id(user_id):
    r = query_one('SELECT id FROM companies WHERE user_id = %s', (user_id,))
    return r['id'] if r else None


# ── LISTAR VAGAS ABERTAS (público) ────────────────────────

@jobs_bp.route('', methods=['GET'])
def listar():
    area       = request.args.get('area')
    modalidade = request.args.get('modalidade')
    tipo       = request.args.get('tipo')
    busca      = request.args.get('busca')
    ordem      = request.args.get('ordem', 'recentes')

    sql = """
        SELECT j.*,
               c.nome_empresa, c.cidade AS empresa_cidade, c.verificada,
               COUNT(DISTINCT p.id) AS total_propostas
        FROM jobs j
        JOIN companies c ON c.id = j.company_id
        LEFT JOIN proposals p ON p.job_id = j.id
        WHERE j.status = 'aberta'
    """
    params = []

    if area:
        sql += ' AND j.area = %s';        params.append(area)
    if modalidade:
        sql += ' AND j.modalidade = %s';  params.append(modalidade)
    if tipo:
        sql += ' AND j.tipo = %s';        params.append(tipo)
    if busca:
        sql += ' AND (j.titulo LIKE %s OR j.habilidades LIKE %s)'
        like = f'%{busca}%'
        params += [like, like]

    sql += ' GROUP BY j.id'
    order_map = {
        'recentes':  'j.criado_em DESC',
        'orcamento': 'j.orcamento_max DESC',
        'propostas': 'total_propostas ASC',
    }
    sql += f' ORDER BY {order_map.get(ordem, "j.criado_em DESC")}'

    rows = query_all(sql, params)
    return jsonify([_serializar(r) for r in rows]), 200


# ── MINHAS VAGAS (empresa logada) ─────────────────────────

@jobs_bp.route('/meus', methods=['GET'])
@login_required
def meus():
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    company_id = _get_company_id(g.user_id)
    if not company_id:
        return jsonify({'mensagem': 'Perfil de empresa não encontrado.'}), 404

    rows = query_all('''
        SELECT j.*, COUNT(DISTINCT p.id) AS total_propostas
        FROM jobs j
        LEFT JOIN proposals p ON p.job_id = j.id
        WHERE j.company_id = %s
        GROUP BY j.id
        ORDER BY j.criado_em DESC
    ''', (company_id,))
    return jsonify([_serializar(r) for r in rows]), 200


# ── DETALHE DE UMA VAGA ───────────────────────────────────

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def detalhe(job_id):
    row = query_one('''
        SELECT j.*,
               c.nome_empresa, c.cidade AS empresa_cidade,
               c.verificada, c.descricao AS empresa_descricao, c.site_url,
               COUNT(DISTINCT p.id) AS total_propostas
        FROM jobs j
        JOIN companies c ON c.id = j.company_id
        LEFT JOIN proposals p ON p.job_id = j.id
        WHERE j.id = %s
        GROUP BY j.id
    ''', (job_id,))

    if not row:
        return jsonify({'mensagem': 'Vaga não encontrada.'}), 404
    return jsonify(_serializar(row)), 200


# ── CRIAR VAGA ────────────────────────────────────────────

@jobs_bp.route('', methods=['POST'])
@login_required
def criar():
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Apenas empresas podem publicar vagas.'}), 403

    company_id = _get_company_id(g.user_id)
    if not company_id:
        return jsonify({'mensagem': 'Perfil de empresa não encontrado.'}), 404

    d = request.get_json(silent=True) or {}
    titulo    = d.get('titulo', '').strip()
    descricao = d.get('descricao', '').strip()

    if not titulo or not descricao:
        return jsonify({'mensagem': 'Título e descrição são obrigatórios.'}), 400

    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO jobs
              (company_id, titulo, descricao, tipo, modalidade, area,
               habilidades, nivel, orcamento_min, orcamento_max, prazo_dias, deadline)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ''', (
            company_id, titulo, descricao,
            d.get('tipo', 'projeto'),
            d.get('modalidade', 'remoto'),
            d.get('area'),
            d.get('habilidades'),
            d.get('nivel'),
            d.get('orcamento_min') or None,
            d.get('orcamento_max') or None,
            d.get('prazo_dias')    or None,
            d.get('deadline')      or None,
        ))
        conn.commit()
        return jsonify({'mensagem': 'Vaga publicada!', 'id': cur.lastrowid}), 201
    except Exception as e:
        conn.rollback()
        print(f'[ERRO criar vaga] {e}')
        return jsonify({'mensagem': 'Erro ao publicar vaga.'}), 500
    finally:
        cur.close()
        conn.close()


# ── EDITAR VAGA ───────────────────────────────────────────

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@login_required
def editar(job_id):
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    company_id = _get_company_id(g.user_id)
    vaga = query_one('SELECT * FROM jobs WHERE id = %s AND company_id = %s', (job_id, company_id))
    if not vaga:
        return jsonify({'mensagem': 'Vaga não encontrada ou sem permissão.'}), 404

    d    = request.get_json(silent=True) or {}
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('''
            UPDATE jobs SET
              titulo=%s, descricao=%s, tipo=%s, modalidade=%s, area=%s,
              habilidades=%s, nivel=%s, orcamento_min=%s, orcamento_max=%s,
              prazo_dias=%s, deadline=%s
            WHERE id=%s
        ''', (
            d.get('titulo',      vaga['titulo']),
            d.get('descricao',   vaga['descricao']),
            d.get('tipo',        vaga['tipo']),
            d.get('modalidade',  vaga['modalidade']),
            d.get('area',        vaga['area']),
            d.get('habilidades', vaga['habilidades']),
            d.get('nivel',       vaga['nivel']),
            d.get('orcamento_min') or vaga['orcamento_min'],
            d.get('orcamento_max') or vaga['orcamento_max'],
            d.get('prazo_dias')    or vaga['prazo_dias'],
            d.get('deadline')      or None,
            job_id
        ))
        conn.commit()
        return jsonify({'mensagem': 'Vaga atualizada!'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'mensagem': 'Erro ao atualizar vaga.'}), 500
    finally:
        cur.close()
        conn.close()


# ── MUDAR STATUS ──────────────────────────────────────────

@jobs_bp.route('/<int:job_id>/status', methods=['PATCH'])
@login_required
def mudar_status(job_id):
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    company_id = _get_company_id(g.user_id)
    vaga = query_one('SELECT id FROM jobs WHERE id = %s AND company_id = %s', (job_id, company_id))
    if not vaga:
        return jsonify({'mensagem': 'Vaga não encontrada ou sem permissão.'}), 404

    novo = (request.get_json(silent=True) or {}).get('status')
    if novo not in ('aberta', 'pausada', 'fechada', 'concluida', 'cancelada'):
        return jsonify({'mensagem': 'Status inválido.'}), 400

    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('UPDATE jobs SET status = %s WHERE id = %s', (novo, job_id))
        conn.commit()
        return jsonify({'mensagem': f'Status alterado para "{novo}".'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'mensagem': 'Erro ao alterar status.'}), 500
    finally:
        cur.close()
        conn.close()