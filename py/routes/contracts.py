# ============================================================
#  WorkFinder — py/routes/contracts.py
#  GET   /api/contratos/meus       contratos do usuário logado
#  PATCH /api/contratos/<id>/status concluir ou cancelar
# ============================================================

from flask import Blueprint, request, jsonify, g
import datetime
from decorators import login_required
from db import get_conn, query_one, query_all, criar_notificacao

contracts_bp = Blueprint('contracts', __name__)


def _serial(row):
    for k in ('iniciado_em', 'concluido_em'):
        if k in row and row[k]:
            row[k] = str(row[k])
    return row


@contracts_bp.route('/meus', methods=['GET'])
@login_required
def meus():
    if g.user_tipo == 'empresa':
        comp = query_one('SELECT id FROM companies WHERE user_id=%s', (g.user_id,))
        if not comp:
            return jsonify([]), 200
        rows = query_all('''
            SELECT ct.*,
                   j.titulo AS vaga_titulo, j.area,
                   f.nome AS freelancer_nome, f.foto_url,
                   EXISTS(
                       SELECT 1 FROM reviews r
                       WHERE r.contract_id = ct.id AND r.avaliador_tipo = 'empresa'
                   ) AS ja_avaliou
            FROM contracts ct
            JOIN jobs j        ON j.id  = ct.job_id
            JOIN freelancers f ON f.id  = ct.freelancer_id
            WHERE ct.company_id = %s
            ORDER BY ct.iniciado_em DESC
        ''', (comp['id'],))
    else:
        free = query_one('SELECT id FROM freelancers WHERE user_id=%s', (g.user_id,))
        if not free:
            return jsonify([]), 200
        rows = query_all('''
            SELECT ct.*,
                   j.titulo AS vaga_titulo, j.area,
                   c.nome_empresa, c.logo_url AS empresa_logo,
                   EXISTS(
                       SELECT 1 FROM reviews r
                       WHERE r.contract_id = ct.id AND r.avaliador_tipo = 'freelancer'
                   ) AS ja_avaliou
            FROM contracts ct
            JOIN jobs j      ON j.id  = ct.job_id
            JOIN companies c ON c.id  = ct.company_id
            WHERE ct.freelancer_id = %s
            ORDER BY ct.iniciado_em DESC
        ''', (free['id'],))

    return jsonify([_serial(r) for r in rows]), 200


@contracts_bp.route('/<int:ct_id>/status', methods=['PATCH'])
@login_required
def mudar_status(ct_id):
    contrato = query_one('SELECT * FROM contracts WHERE id=%s', (ct_id,))
    if not contrato:
        return jsonify({'mensagem': 'Contrato não encontrado.'}), 404

    novo = (request.get_json(silent=True) or {}).get('status')
    if novo not in ('concluido', 'cancelado'):
        return jsonify({'mensagem': 'Status inválido. Use "concluido" ou "cancelado".'}), 400

    conn = get_conn()
    cur  = conn.cursor()
    try:
        agora = datetime.datetime.utcnow() if novo == 'concluido' else None
        cur.execute(
            'UPDATE contracts SET status=%s, concluido_em=%s WHERE id=%s',
            (novo, agora, ct_id)
        )
        if novo == 'concluido':
            cur.execute("UPDATE jobs SET status='concluida' WHERE id=%s", (contrato['job_id'],))
        conn.commit()
        # Notifica o outro lado sobre a mudança de status
        if novo == 'concluido':
            info = query_one('''
                SELECT j.titulo, c.user_id AS empresa_uid, f.user_id AS free_uid
                FROM contracts ct
                JOIN jobs j        ON j.id = ct.job_id
                JOIN companies c   ON c.id = ct.company_id
                JOIN freelancers f ON f.id = ct.freelancer_id
                WHERE ct.id = %s
            ''', (ct_id,))
            if info:
                # Notifica ambos os lados — quem concluiu e quem precisa avaliar
                criar_notificacao(info['empresa_uid'], 'contrato_concluido',
                    'Contrato concluído ✅',
                    f'O contrato "{info["titulo"]}" foi marcado como concluído. Avalie o freelancer agora!',
                    'contratos.html')
                criar_notificacao(info['free_uid'], 'contrato_concluido',
                    'Contrato concluído ✅',
                    f'O contrato "{info["titulo"]}" foi marcado como concluído. Avalie a empresa agora!',
                    'contratos.html')
        return jsonify({'mensagem': f'Contrato marcado como {novo}.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'mensagem': 'Erro ao atualizar contrato.'}), 500
    finally:
        cur.close()
        conn.close()