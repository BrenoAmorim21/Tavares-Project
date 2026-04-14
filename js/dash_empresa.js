// WorkFinder — dash_empresa.js (Dashboard real via API)

let jobs = [];
let filtroAtivo = 'todos';

async function carregarJobs() {
    try {
        jobs = await API.get('/vagas/meus');
        atualizarStats();
        renderJobs();
    } catch (e) {
        document.getElementById('job-list').innerHTML = '<p style="color:#DC2626;padding:1rem">Erro ao carregar projetos.</p>';
    }
}

function atualizarStats() {
    const abertos = jobs.filter(j => j.status === 'aberta').length;
    const propostas = jobs.reduce((a, j) => a + (j.total_propostas || 0), 0);
    const concluidos = jobs.filter(j => j.status === 'concluida').length;
    const el = id => document.getElementById(id);
    if (el('stat-total')) el('stat-total').textContent = jobs.length;
    if (el('stat-abertos')) el('stat-abertos').textContent = abertos;
    if (el('stat-propostas')) el('stat-propostas').textContent = propostas;
    if (el('stat-contratados')) el('stat-contratados').textContent = concluidos;
}

function badgeModal(m) {
    const map = { remoto: 'badge-remoto', presencial: 'badge-presencial', hibrido: 'badge-hibrido' };
    const label = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
    return `<span class="badge ${map[m] || ''}">${label[m] || m}</span>`;
}

function badgeStatus(s) {
    const map = { aberta: 'badge-aberta', fechada: 'badge-fechada', pausada: 'badge-pausada', concluida: 'badge-aberta', cancelada: 'badge-fechada' };
    const label = { aberta: 'Aberta', fechada: 'Fechada', pausada: 'Pausada', concluida: 'Concluída', cancelada: 'Cancelada' };
    return `<span class="badge ${map[s] || ''}">${label[s] || s}</span>`;
}

function renderJobs() {
    const lista = filtroAtivo === 'todos' ? jobs : jobs.filter(j => j.status === filtroAtivo);
    const el = document.getElementById('job-list');
    if (lista.length === 0) {
        el.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><p>Nenhum projeto nesta categoria.</p><button class="btn-primary" onclick="location.href='pub_vaga.html'">+ Publicar projeto</button></div>`;
        return;
    }
    const orc = j => j.orcamento_min && j.orcamento_max ? `${fmtMoeda(j.orcamento_min)} – ${fmtMoeda(j.orcamento_max)}` : 'A combinar';
    el.innerHTML = lista.map(j => `
    <div class="job-card">
      <div>
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
          ${badgeStatus(j.status)} ${badgeModal(j.modalidade)}
          <span class="badge" style="background:var(--surface);color:var(--ink-mid)">${j.tipo}</span>
        </div>
        <div class="job-title">${j.titulo}</div>
        <div class="job-meta-row">
          <span class="meta-item" style="color:var(--green);font-weight:500">${orc(j)}</span>
          <span class="meta-item">⏱ ${j.prazo_dias ? j.prazo_dias + ' dias' : 'A combinar'}</span>
          <span class="meta-item">${fmtRelativo(j.criado_em)}</span>
        </div>
        <div class="job-desc">${j.descricao}</div>
      </div>
      <div class="job-actions">
        <span class="propostas-count" onclick="verPropostas(${j.id})">👥 ${j.total_propostas || 0} proposta${j.total_propostas !== 1 ? 's' : ''}</span>
        ${j.status === 'aberta' ? `<button class="btn-sm btn-sm-outline" onclick="mudarStatus(${j.id},'pausada')">⏸ Pausar</button>` : ''}
        ${j.status === 'pausada' ? `<button class="btn-sm btn-sm-primary" onclick="mudarStatus(${j.id},'aberta')">▶ Reativar</button>` : ''}
        <button class="btn-sm btn-sm-danger" onclick="mudarStatus(${j.id},'cancelada')">Encerrar</button>
      </div>
    </div>`).join('');
}

async function mudarStatus(id, status) {
    if (!confirm(`Alterar status para "${status}"?`)) return;
    try {
        await API.patch(`/vagas/${id}/status`, { status });
        toast(`Status alterado para "${status}"!`);
        carregarJobs();
    } catch (e) { toast(e.mensagem || 'Erro ao alterar status.', 'error'); }
}

async function verPropostas(jobId) {
    document.getElementById('modal-cand-lista').innerHTML = '<p style="color:#718096">Carregando...</p>';
    document.getElementById('modal-cand').classList.add('open');
    try {
        const props = await API.get(`/propostas/vaga/${jobId}`);
        document.getElementById('modal-cand-titulo').textContent = 'Propostas recebidas';
        if (props.length === 0) {
            document.getElementById('modal-cand-lista').innerHTML = '<p style="color:#718096">Nenhuma proposta recebida ainda.</p>';
            return;
        }
        document.getElementById('modal-cand-lista').innerHTML = props.map(p => `
      <div class="candidato-card">
        <div class="cand-avatar" style="background:#EBF2FF;color:#1A56DB">${iniciais(p.freelancer_nome)}</div>
        <div class="cand-info">
          <div class="cand-name">${p.freelancer_nome}</div>
          <div class="cand-area">${p.area || ''} · ${p.experiencia || ''}</div>
          <div class="cand-valor">Proposta: ${p.valor_proposto ? fmtMoeda(p.valor_proposto) : 'A combinar'}</div>
          <div style="font-size:.8rem;color:#718096;margin-top:.2rem">${p.mensagem.substring(0, 100)}...</div>
          ${p.media_nota > 0 ? `<div style="font-size:.78rem;color:#D97706">⭐ ${Number(p.media_nota).toFixed(1)}</div>` : ''}
        </div>
        <div class="cand-actions">
          ${p.status === 'pendente' ? `
            <button class="btn-accept" onclick="responderProposta(${p.id},'aceita')">✓ Aceitar</button>
            <button class="btn-reject" onclick="responderProposta(${p.id},'recusada')">✕</button>
          `: `<span class="badge badge-${p.status}">${p.status}</span>`}
        </div>
      </div>`).join('');
    } catch (e) {
        document.getElementById('modal-cand-lista').innerHTML = '<p style="color:#DC2626">Erro ao carregar propostas.</p>';
    }
}

async function responderProposta(id, status) {
    const msg = status === 'aceita' ? 'Aceitar esta proposta? Um contrato será criado automaticamente.' : 'Recusar esta proposta?';
    if (!confirm(msg)) return;
    try {
        await API.patch(`/propostas/${id}/status`, { status });
        toast(status === 'aceita' ? 'Proposta aceita! Contrato criado. 🎉' : 'Proposta recusada.');
        fecharModal('modal-cand');
        carregarJobs();
    } catch (e) { toast(e.mensagem || 'Erro ao responder.', 'error'); }
}

function setTab(el, filtro) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filtroAtivo = filtro;
    renderJobs();
}

function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }
function fecharModalFora(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    const nome = Sessao.nome || 'Empresa';
    const el = document.getElementById('nome-empresa'); if (el) el.textContent = nome;
    carregarJobs();
});