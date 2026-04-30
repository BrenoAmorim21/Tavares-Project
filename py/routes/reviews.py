# ============================================================
#  WorkFinder — py/routes/reviews.py
#  POST /api/avaliacoes              envia avaliação
#  GET  /api/avaliacoes/empresa/<id> avaliações de uma empresa
#  GET  /api/avaliacoes/freelancer/<id> avaliações de um freelancer
# ============================================================

from flask import Blueprint, request, jsonify, g
from decorators import login_required
from db import get_conn, query_one, query_all

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('', methods=['POST'])
@login_required
def avaliar():
    d           = request.get_json(silent=True) or {}
    contract_id = d.get('contract_id')
    nota        = d.get('nota')
    comentario  = d.get('comentario', '').strip()

    if not contract_id or nota is None:
        return jsonify({'mensagem': 'contract_id e nota são obrigatórios.'}), 400
    if not (1 <= int(nota) <= 5):
        return jsonify({'mensagem': 'Nota deve ser entre 1 e 5.'}), 400

    contrato = query_one('SELECT * FROM contracts WHERE id = %s', (contract_id,))
    if not contrato:
        return jsonify({'mensagem': 'Contrato não encontrado.'}), 404
    if contrato['status'] != 'concluido':
        return jsonify({'mensagem': 'Só é possível avaliar contratos concluídos.'}), 409

    # Determina quem está avaliando e quem está sendo avaliado
    avaliador_tipo = g.user_tipo
    if avaliador_tipo == 'empresa':
        # empresa avalia o freelancer
        avaliado_uid = query_one(
            'SELECT user_id FROM freelancers WHERE id = %s', (contrato['freelancer_id'],)
        )
    else:
        # freelancer avalia a empresa
        avaliado_uid = query_one(
            'SELECT user_id FROM companies WHERE id = %s', (contrato['company_id'],)
        )

    if not avaliado_uid:
        return jsonify({'mensagem': 'Usuário avaliado não encontrado.'}), 404

    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO reviews (contract_id, avaliador_tipo, avaliado_user_id, nota, comentario)
            VALUES (%s, %s, %s, %s, %s)
        ''', (contract_id, avaliador_tipo, avaliado_uid['user_id'], int(nota), comentario))
        conn.commit()
        return jsonify({'mensagem': 'Avaliação enviada!'}), 201
    except Exception as e:
        conn.rollback()
        if 'Duplicate' in str(e):
            return jsonify({'mensagem': 'Você já avaliou este contrato.'}), 409
        return jsonify({'mensagem': 'Erro ao enviar avaliação.'}), 500
    finally:
        cur.close()
        conn.close()


@reviews_bp.route('/meu-contrato/<int:contract_id>', methods=['GET'])
@login_required
def minha_avaliacao(contract_id):
    """Verifica se o usuário logado já avaliou um contrato específico."""
    row = query_one(
        'SELECT id FROM reviews WHERE contract_id=%s AND avaliador_tipo=%s',
        (contract_id, g.user_tipo)
    )
    return jsonify({'avaliado': row is not None}), 200


@reviews_bp.route('/empresa/<int:company_id>', methods=['GET'])
def da_empresa(company_id):
    rows = query_all('''
        SELECT r.nota, r.comentario, r.criado_em,
               f.nome AS avaliador_nome
        FROM reviews r
        JOIN contracts ct  ON ct.id = r.contract_id
        JOIN freelancers f ON f.id  = ct.freelancer_id
        WHERE ct.company_id = %s AND r.avaliador_tipo = 'freelancer'
        ORDER BY r.criado_em DESC
    ''', (company_id,))
    for r in rows:
        r['criado_em'] = str(r['criado_em'])
    return jsonify(rows), 200


@reviews_bp.route('/freelancer/<int:freelancer_id>', methods=['GET'])
def do_freelancer(freelancer_id):
    rows = query_all('''
        SELECT r.nota, r.comentario, r.criado_em,
               c.nome_empresa AS avaliador_nome
        FROM reviews r
        JOIN contracts ct  ON ct.id = r.contract_id
        JOIN companies c   ON c.id  = ct.company_id
        WHERE ct.freelancer_id = %s AND r.avaliador_tipo = 'empresa'
        ORDER BY r.criado_em DESC
    ''', (freelancer_id,))
    for r in rows:
        r['criado_em'] = str(r['criado_em'])
    return jsonify(rows), 200