# ============================================================
#  WorkFinder — py/routes/stats.py
#  GET /api/stats/empresa      stats do dashboard da empresa
#  GET /api/stats/freelancer   stats do dashboard do freelancer
# ============================================================

from flask import Blueprint, jsonify, g
from decorators import login_required
from db import query_one

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/empresa', methods=['GET'])
@login_required
def stats_empresa():
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    comp = query_one('SELECT id FROM companies WHERE user_id=%s', (g.user_id,))
    if not comp:
        return jsonify({}), 200

    row = query_one('SELECT * FROM vw_company_stats WHERE company_id=%s', (comp['id'],))
    if not row:
        return jsonify({}), 200

    # Converte Decimal → float para JSON
    row = {k: float(v) if hasattr(v, 'is_integer') else v for k, v in row.items()}
    return jsonify(row), 200


@stats_bp.route('/freelancer', methods=['GET'])
@login_required
def stats_freelancer():
    if g.user_tipo != 'freelancer':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    free = query_one('SELECT id FROM freelancers WHERE user_id=%s', (g.user_id,))
    if not free:
        return jsonify({}), 200

    row = query_one('SELECT * FROM vw_freelancer_stats WHERE freelancer_id=%s', (free['id'],))
    if not row:
        return jsonify({}), 200

    row = {k: float(v) if hasattr(v, 'is_integer') else v for k, v in row.items()}
    return jsonify(row), 200