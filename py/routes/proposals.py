# ============================================================
#  WorkFinder — py/routes/proposals.py
#  POST   /api/propostas                  freelancer envia proposta
#  GET    /api/propostas/minhas           propostas do freelancer logado
#  GET    /api/propostas/vaga/<job_id>    empresa vê propostas de uma vaga
#  PATCH  /api/propostas/<id>/status      empresa aceita/recusa
#  DELETE /api/propostas/<id>             freelancer cancela
# ============================================================

from flask import Blueprint, request, jsonify, g
import datetime
from decorators import login_required
from db import get_conn, query_one, query_all, criar_notificacao

proposals_bp = Blueprint('proposals', __name__)


def _get_freelancer_id(user_id):
    r = query_one('SELECT id FROM freelancers WHERE user_id = %s', (user_id,))
    return r['id'] if r else None

def _get_company_id(user_id):
    r = query_one('SELECT id FROM companies WHERE user_id = %s', (user_id,))
    return r['id'] if r else None

def _serial(row):
    for k in ('criado_em', 'respondido_em'):
        if k in row and row[k]:
            row[k] = str(row[k])
    return row


# ─── ENVIAR PROPOSTA ───────────────────────────────────────

@proposals_bp.route('', methods=['POST'])
@login_required
def enviar():
    if g.user_tipo != 'freelancer':
        return jsonify({'mensagem': 'Apenas freelancers podem enviar propostas.'}), 403

    freelancer_id = _get_freelancer_id(g.user_id)
    if not freelancer_id:
        return jsonify({'mensagem': 'Perfil de freelancer não encontrado.'}), 404

    d         = request.get_json(silent=True) or {}
    job_id    = d.get('job_id')
    mensagem  = (d.get('mensagem') or '').strip()

    if not job_id or not mensagem:
        return jsonify({'mensagem': 'job_id e mensagem são obrigatórios.'}), 400

    # Vaga deve estar aberta
    vaga = query_one("SELECT id, status FROM jobs WHERE id = %s", (job_id,))
    if not vaga:
        return jsonify({'mensagem': 'Vaga não encontrada.'}), 404
    if vaga['status'] != 'aberta':
        return jsonify({'mensagem': 'Esta vaga não está mais aceitando propostas.'}), 409

    # Não pode duplicar
    existe = query_one(
        'SELECT id FROM proposals WHERE job_id=%s AND freelancer_id=%s',
        (job_id, freelancer_id)
    )
    if existe:
        return jsonify({'mensagem': 'Você já enviou uma proposta para esta vaga.'}), 409

    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute('''
            INSERT INTO proposals (job_id, freelancer_id, mensagem, valor_proposto, prazo_proposto)
            VALUES (%s, %s, %s, %s, %s)
        ''', (job_id, freelancer_id, mensagem,
              d.get('valor_proposto') or None,
              d.get('prazo_proposto') or None))
        conn.commit()
        prop_id = cur.lastrowid

        # Notifica a empresa sobre nova proposta
        info = query_one('''
            SELECT j.titulo, c.user_id AS empresa_uid, f.nome AS freelancer_nome
            FROM jobs j
            JOIN companies c ON c.id = j.company_id
            JOIN freelancers f ON f.id = %s
            WHERE j.id = %s
        ''', (freelancer_id, job_id))
        if info:
            criar_notificacao(
                info['empresa_uid'], 'nova_proposta',
                'Nova proposta recebida 👥',
                f'{info["freelancer_nome"]} enviou uma proposta para "{info["titulo"]}".',
                'dash_empresa.html'
            )

        return jsonify({'mensagem': 'Proposta enviada!', 'id': prop_id}), 201
    except Exception as e:
        conn.rollback()
        print(f'[ERRO enviar proposta] {e}')
        return jsonify({'mensagem': 'Erro ao enviar proposta.'}), 500
    finally:
        cur.close()
        conn.close()


# ─── MINHAS PROPOSTAS (freelancer) ─────────────────────────

@proposals_bp.route('/minhas', methods=['GET'])
@login_required
def minhas():
    if g.user_tipo != 'freelancer':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    freelancer_id = _get_freelancer_id(g.user_id)
    rows = query_all('''
        SELECT p.*,
               j.titulo AS vaga_titulo, j.modalidade, j.tipo AS vaga_tipo,
               c.nome_empresa, c.verificada
        FROM proposals p
        JOIN jobs j      ON j.id = p.job_id
        JOIN companies c ON c.id = j.company_id
        WHERE p.freelancer_id = %s
        ORDER BY p.criado_em DESC
    ''', (freelancer_id,))
    return jsonify([_serial(r) for r in rows]), 200


# ─── PROPOSTAS DE UMA VAGA (empresa) ───────────────────────

@proposals_bp.route('/vaga/<int:job_id>', methods=['GET'])
@login_required
def da_vaga(job_id):
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    company_id = _get_company_id(g.user_id)
    vaga = query_one('SELECT id FROM jobs WHERE id=%s AND company_id=%s', (job_id, company_id))
    if not vaga:
        return jsonify({'mensagem': 'Vaga não encontrada ou sem permissão.'}), 404

    rows = query_all('''
        SELECT p.*,
               f.nome AS freelancer_nome, f.area, f.experiencia,
               f.habilidades, f.portfolio_url, f.foto_url,
               COALESCE(AVG(r.nota), 0) AS media_nota
        FROM proposals p
        JOIN freelancers f ON f.id = p.freelancer_id
        LEFT JOIN contracts ct ON ct.freelancer_id = f.id
        LEFT JOIN reviews r   ON r.contract_id = ct.id AND r.avaliador_tipo = 'empresa'
        WHERE p.job_id = %s
        GROUP BY p.id
        ORDER BY p.criado_em ASC
    ''', (job_id,))
    return jsonify([_serial(r) for r in rows]), 200


# ─── RESPONDER PROPOSTA (empresa aceita ou recusa) ─────────

@proposals_bp.route('/<int:prop_id>/status', methods=['PATCH'])
@login_required
def responder(prop_id):
    if g.user_tipo != 'empresa':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    company_id = _get_company_id(g.user_id)
    prop = query_one('''
        SELECT p.*, j.company_id, j.status AS vaga_status
        FROM proposals p JOIN jobs j ON j.id = p.job_id
        WHERE p.id = %s
    ''', (prop_id,))

    if not prop or prop['company_id'] != company_id:
        return jsonify({'mensagem': 'Proposta não encontrada ou sem permissão.'}), 404
    if prop['status'] != 'pendente':
        return jsonify({'mensagem': 'Esta proposta já foi respondida.'}), 409

    novo_status = (request.get_json(silent=True) or {}).get('status')
    if novo_status not in ('aceita', 'recusada'):
        return jsonify({'mensagem': 'Status deve ser "aceita" ou "recusada".'}), 400

    conn = get_conn()
    cur  = conn.cursor()
    try:
        agora = datetime.datetime.utcnow()
        cur.execute(
            'UPDATE proposals SET status=%s, respondido_em=%s WHERE id=%s',
            (novo_status, agora, prop_id)
        )

        if novo_status == 'aceita':
            # Cria contrato
            cur.execute('''
                INSERT INTO contracts
                  (job_id, proposal_id, company_id, freelancer_id, valor_final, prazo_final)
                VALUES (%s,%s,%s,%s,%s,%s)
            ''', (
                prop['job_id'], prop_id, company_id,
                prop['freelancer_id'],
                prop['valor_proposto'],
                prop['prazo_proposto']
            ))
            # Fecha a vaga
            cur.execute(
                "UPDATE jobs SET status='fechada' WHERE id=%s",
                (prop['job_id'],)
            )
            # Recusa automaticamente as outras propostas pendentes
            cur.execute('''
                UPDATE proposals SET status='recusada', respondido_em=%s
                WHERE job_id=%s AND id != %s AND status='pendente'
            ''', (agora, prop['job_id'], prop_id))

        conn.commit()

        # Notifica o freelancer sobre a resposta
        free_user = query_one('SELECT user_id FROM freelancers WHERE id=%s', (prop['freelancer_id'],))
        vaga_info = query_one('SELECT titulo FROM jobs WHERE id=%s', (prop['job_id'],))
        if free_user and vaga_info:
            if novo_status == 'aceita':
                criar_notificacao(
                    free_user['user_id'], 'proposta_aceita',
                    'Sua proposta foi aceita! 🎉',
                    f'Parabéns! Sua proposta para "{vaga_info["titulo"]}" foi aceita. Contrato criado.',
                    'contratos.html'
                )
            else:
                criar_notificacao(
                    free_user['user_id'], 'proposta_recusada',
                    'Proposta não selecionada',
                    f'Sua proposta para "{vaga_info["titulo"]}" não foi selecionada desta vez.',
                    'propostas.html'
                )

        msg = 'Proposta aceita! Contrato criado.' if novo_status == 'aceita' else 'Proposta recusada.'
        return jsonify({'mensagem': msg}), 200

    except Exception as e:
        conn.rollback()
        print(f'[ERRO responder proposta] {e}')
        return jsonify({'mensagem': 'Erro ao responder proposta.'}), 500
    finally:
        cur.close()
        conn.close()


# ─── CANCELAR PROPOSTA (freelancer) ────────────────────────

@proposals_bp.route('/<int:prop_id>', methods=['DELETE'])
@login_required
def cancelar(prop_id):
    if g.user_tipo != 'freelancer':
        return jsonify({'mensagem': 'Acesso negado.'}), 403

    freelancer_id = _get_freelancer_id(g.user_id)
    prop = query_one(
        'SELECT id, status FROM proposals WHERE id=%s AND freelancer_id=%s',
        (prop_id, freelancer_id)
    )
    if not prop:
        return jsonify({'mensagem': 'Proposta não encontrada.'}), 404
    if prop['status'] != 'pendente':
        return jsonify({'mensagem': 'Só é possível cancelar propostas pendentes.'}), 409

    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute("UPDATE proposals SET status='cancelada' WHERE id=%s", (prop_id,))
        conn.commit()
        return jsonify({'mensagem': 'Proposta cancelada.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'mensagem': 'Erro ao cancelar proposta.'}), 500
    finally:
        cur.close()
        conn.close()