# ============================================================
#  WorkFinder — py/routes/users.py
#  GET  /api/usuarios/perfil       perfil do usuário logado
#  PUT  /api/usuarios/perfil       atualiza perfil
#  GET  /api/usuarios/freelancer/<id>  perfil público
#  GET  /api/usuarios/empresa/<id>     perfil público
# ============================================================

from flask import Blueprint, request, jsonify, g
from decorators import login_required
from db import get_conn, query_one

users_bp = Blueprint('users', __name__)


def _serial(row):
    if not row:
        return row
    for k in ('atualizado_em', 'criado_em'):
        if k in row and row[k]:
            row[k] = str(row[k])
    # Nunca expõe senha
    row.pop('senha_hash', None)
    return row


@users_bp.route('/perfil', methods=['GET'])
@login_required
def perfil():
    if g.user_tipo == 'empresa':
        row = query_one(
            'SELECT * FROM companies WHERE user_id=%s', (g.user_id,)
        )
    else:
        row = query_one(
            'SELECT * FROM freelancers WHERE user_id=%s', (g.user_id,)
        )
    if not row:
        return jsonify({'mensagem': 'Perfil não encontrado.'}), 404
    return jsonify(_serial(row)), 200


@users_bp.route('/perfil', methods=['PUT'])
@login_required
def atualizar():
    d = request.get_json(silent=True) or {}
    conn = get_conn()
    cur  = conn.cursor()
    try:
        if g.user_tipo == 'empresa':
            cur.execute('''
                UPDATE companies SET
                  nome_empresa=%s, setor=%s, tamanho=%s,
                  descricao=%s, site_url=%s, cidade=%s, estado=%s
                WHERE user_id=%s
            ''', (
                d.get('nome_empresa'), d.get('setor'), d.get('tamanho'),
                d.get('descricao'),   d.get('site_url'),
                d.get('cidade'),      d.get('estado'),
                g.user_id
            ))
        else:
            cur.execute('''
                UPDATE freelancers SET
                  nome=%s, area=%s, experiencia=%s, habilidades=%s,
                  portfolio_url=%s, bio=%s, cidade=%s, estado=%s,
                  pretensao_hora=%s, disponivel=%s
                WHERE user_id=%s
            ''', (
                d.get('nome'),        d.get('area'),        d.get('experiencia'),
                d.get('habilidades'), d.get('portfolio_url'), d.get('bio'),
                d.get('cidade'),      d.get('estado'),
                d.get('pretensao_hora') or None,
                1 if d.get('disponivel', True) else 0,
                g.user_id
            ))
        conn.commit()
        return jsonify({'mensagem': 'Perfil atualizado!'}), 200
    except Exception as e:
        conn.rollback()
        print(f'[ERRO atualizar perfil] {e}')
        return jsonify({'mensagem': 'Erro ao atualizar perfil.'}), 500
    finally:
        cur.close()
        conn.close()


@users_bp.route('/freelancer/<int:freelancer_id>', methods=['GET'])
def freelancer_publico(freelancer_id):
    row = query_one('''
        SELECT f.*,
               COALESCE(AVG(r.nota),0) AS media_nota,
               COUNT(DISTINCT r.id)    AS total_avaliacoes,
               COUNT(DISTINCT ct.id)   AS projetos_concluidos
        FROM freelancers f
        LEFT JOIN contracts ct ON ct.freelancer_id = f.id AND ct.status='concluido'
        LEFT JOIN reviews r    ON r.contract_id = ct.id AND r.avaliador_tipo='empresa'
        WHERE f.id = %s
        GROUP BY f.id
    ''', (freelancer_id,))
    if not row:
        return jsonify({'mensagem': 'Freelancer não encontrado.'}), 404
    row.pop('cpf', None)   # nunca expõe CPF
    return jsonify(_serial(row)), 200


@users_bp.route('/empresa/<int:company_id>', methods=['GET'])
def empresa_publica(company_id):
    row = query_one('''
        SELECT c.*,
               COUNT(DISTINCT j.id)   AS total_projetos,
               SUM(j.status='aberta') AS projetos_abertos,
               COALESCE(AVG(r.nota),0) AS media_nota,
               COUNT(DISTINCT r.id)    AS total_avaliacoes
        FROM companies c
        LEFT JOIN jobs j      ON j.company_id = c.id
        LEFT JOIN contracts ct ON ct.company_id = c.id
        LEFT JOIN reviews r    ON r.contract_id = ct.id AND r.avaliador_tipo='freelancer'
        WHERE c.id = %s
        GROUP BY c.id
    ''', (company_id,))
    if not row:
        return jsonify({'mensagem': 'Empresa não encontrada.'}), 404
    row.pop('cnpj', None)   # não expõe CNPJ publicamente
    return jsonify(_serial(row)), 200