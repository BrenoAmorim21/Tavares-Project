# ============================================================
#  WorkFinder — py/routes/stats.py
#  GET /api/stats/empresa      stats do dashboard da empresa
#  GET /api/stats/freelancer   stats do dashboard do freelancer
#  Não usa views — SQL inline para não depender de migrações
# ============================================================

from flask import Blueprint, jsonify, g
from decorators import login_required
from db import query_one, query_all

stats_bp = Blueprint('stats', __name__)


def _to_float(v):
    if v is None:
        return 0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0


@stats_bp.route('/empresa', methods=['GET'])
@login_required
def stats_empresa():
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    comp = query_one('SELECT id FROM companies WHERE user_id=%s', (g.user_id,))
    if not comp:
        return jsonify({}), 200
    cid = comp['id']

    row = query_one('''
        SELECT
            (SELECT COUNT(*)   FROM jobs       WHERE company_id = %(cid)s)                                    AS total_projetos,
            (SELECT COUNT(*)   FROM jobs       WHERE company_id = %(cid)s AND status = 'aberta')              AS projetos_abertos,
            (SELECT COUNT(*)   FROM proposals p JOIN jobs j ON j.id = p.job_id WHERE j.company_id = %(cid)s) AS total_propostas,
            (SELECT COUNT(*)   FROM contracts   WHERE company_id = %(cid)s)                                   AS total_contratos,
            (SELECT COUNT(*)   FROM contracts   WHERE company_id = %(cid)s AND status = 'concluido')          AS contratos_concluidos,
            (SELECT COALESCE(ROUND(AVG(r.nota),1),0)
             FROM reviews r JOIN contracts ct ON ct.id = r.contract_id
             WHERE ct.company_id = %(cid)s AND r.avaliador_tipo = 'freelancer')                               AS media_nota,
            (SELECT COUNT(*)
             FROM reviews r JOIN contracts ct ON ct.id = r.contract_id
             WHERE ct.company_id = %(cid)s AND r.avaliador_tipo = 'freelancer')                               AS total_avaliacoes
    ''', {'cid': cid})

    # Propostas por projeto para o gráfico (últimos 6 projetos com mais propostas)
    grafico = query_all('''
        SELECT j.titulo, COUNT(p.id) AS total_propostas
        FROM jobs j
        LEFT JOIN proposals p ON p.job_id = j.id
        WHERE j.company_id = %s
        GROUP BY j.id
        ORDER BY j.criado_em DESC
        LIMIT 6
    ''', (cid,))

    result = {k: _to_float(v) for k, v in (row or {}).items()}
    result['grafico_propostas'] = [
        {'label': r['titulo'][:28] + ('…' if len(r['titulo']) > 28 else ''), 'valor': int(r['total_propostas'])}
        for r in grafico
    ]
    return jsonify(result), 200


@stats_bp.route('/freelancer', methods=['GET'])
@login_required
def stats_freelancer():
    if g.user_tipo != 'freelancer':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    free = query_one('SELECT id FROM freelancers WHERE user_id=%s', (g.user_id,))
    if not free:
        return jsonify({}), 200
    fid = free['id']

    row = query_one('''
        SELECT
            (SELECT COUNT(*) FROM proposals  WHERE freelancer_id = %(fid)s)                                           AS propostas_enviadas,
            (SELECT COUNT(*) FROM proposals  WHERE freelancer_id = %(fid)s AND status = 'aceita')                     AS propostas_aceitas,
            (SELECT COUNT(*) FROM contracts  WHERE freelancer_id = %(fid)s)                                           AS total_contratos,
            (SELECT COUNT(*) FROM contracts  WHERE freelancer_id = %(fid)s AND status = 'concluido')                  AS contratos_concluidos,
            (SELECT COALESCE(ROUND(AVG(r.nota),1),0)
             FROM reviews r JOIN contracts ct ON ct.id = r.contract_id
             WHERE ct.freelancer_id = %(fid)s AND r.avaliador_tipo = 'empresa')                                       AS media_nota,
            (SELECT COUNT(*)
             FROM reviews r JOIN contracts ct ON ct.id = r.contract_id
             WHERE ct.freelancer_id = %(fid)s AND r.avaliador_tipo = 'empresa')                                       AS total_avaliacoes
    ''', {'fid': fid})

    result = {k: _to_float(v) for k, v in (row or {}).items()}

    # Taxa de aceite
    env = result.get('propostas_enviadas', 0)
    ace = result.get('propostas_aceitas', 0)
    result['taxa_aceite'] = round((ace / env * 100) if env > 0 else 0, 1)

    return jsonify(result), 200
