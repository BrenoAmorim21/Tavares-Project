# ============================================================
#  WorkFinder — py/routes/notifications.py
#  GET   /api/notificacoes                lista as últimas 20
#  GET   /api/notificacoes/nao-lidas      retorna contagem
#  PATCH /api/notificacoes/<id>/lida      marca uma como lida
#  PATCH /api/notificacoes/marcar-todas   marca todas como lidas
# ============================================================

from flask import Blueprint, jsonify, g
from decorators import login_required
from db import get_conn, query_all, query_one

notif_bp = Blueprint('notifications', __name__)


def _serial(row):
    if row.get('criado_em'):
        row['criado_em'] = str(row['criado_em'])
    return row


@notif_bp.route('', methods=['GET'])
@login_required
def listar():
    rows = query_all(
        'SELECT * FROM notifications WHERE user_id=%s ORDER BY criado_em DESC LIMIT 20',
        (g.user_id,)
    )
    return jsonify([_serial(r) for r in rows]), 200


@notif_bp.route('/nao-lidas', methods=['GET'])
@login_required
def nao_lidas():
    row = query_one(
        'SELECT COUNT(*) AS n FROM notifications WHERE user_id=%s AND lida=0',
        (g.user_id,)
    )
    return jsonify({'count': int(row['n']) if row else 0}), 200


@notif_bp.route('/<int:nid>/lida', methods=['PATCH'])
@login_required
def marcar_lida(nid):
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute(
            'UPDATE notifications SET lida=1 WHERE id=%s AND user_id=%s',
            (nid, g.user_id)
        )
        conn.commit()
        return jsonify({'mensagem': 'OK'}), 200
    except Exception:
        conn.rollback()
        return jsonify({'mensagem': 'Erro.'}), 500
    finally:
        cur.close()
        conn.close()


@notif_bp.route('/marcar-todas', methods=['PATCH'])
@login_required
def marcar_todas():
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('UPDATE notifications SET lida=1 WHERE user_id=%s', (g.user_id,))
        conn.commit()
        return jsonify({'mensagem': 'OK'}), 200
    except Exception:
        conn.rollback()
        return jsonify({'mensagem': 'Erro.'}), 500
    finally:
        cur.close()
        conn.close()
