// ============================================================
//  WorkFinder — assets/js/dash_empresa.js
//  Dashboard da empresa — integrado com API real
// ============================================================

let jobs = [];
let filtroAtivo = 'todos';

async function carregarJobs() {
    try {
        jobs = await API.get('/vagas/meus');
        atualizarStats();
        renderJobs();
    } catch (e) {
        document.getElementById('job-list').innerHTML =
            '<p style="text-align:center;color:#DC2626;padding:2rem">Erro ao carregar projetos. O servidor está rodando?</p>';
    }
}

function atualizarStats() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('stat-total', jobs.length);
    set('stat-abertos', jobs.filter(j => j.status === 'aberta').length);

    const totalProps = jobs.reduce((acc, j) => acc + (j.total_propostas || 0), 0);
    set('stat-propostas', totalProps);

    const contratados = jobs.filter(j => j.status === 'fechada' || j.status === 'concluida').length;
    set('stat-contratados', contratados);

    // Update tab counts
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length >= 4) {
        const abertos = jobs.filter(j => j.status === 'aberta').length;
        const pausados = jobs.filter(j => j.status === 'pausada').length;
        const fechados = jobs.filter(j => j.status === 'fechada' || j.status === 'concluida').length;
        tabs[0].textContent = `Todos (${jobs.length})`;
        tabs[1].textContent = `Abertos (${abertos})`;
        tabs[2].textContent = `Pausados (${pausados})`;
        tabs[3].textContent = `Fechados (${fechados})`;
    }
}

function badgeModal(m) {
    const map = { remoto: 'badge-remoto', presencial: 'badge-presencial', hibrido: 'badge-hibrido' };
    const label = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
    return `<span class="badge ${map[m] || ''}">${label[m] || m}</span>`;
}

function badgeStatus(s) {
    const map = { aberta: 'badge-aberta', fechada: 'badge-fechada', pausada: 'badge-pausada', concluida: 'badge-fechada', cancelada: 'badge-fechada' };
    const label = { aberta: 'Aberta', fechada: 'Fechada', pausada: 'Pausada', concluida: 'Concluída', cancelada: 'Cancelada' };
    return `<span class="badge ${map[s] || ''}">${label[s] || s}</span>`;
}

function renderJobs() {
    const lista = filtroAtivo === 'todos' ? jobs
        : filtroAtivo === 'fechada' ? jobs.filter(j => j.status === 'fechada' || j.status === 'concluida')
        : jobs.filter(j => j.status === filtroAtivo);

    const el = document.getElementById('job-list');

    if (lista.length === 0) {
        el.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📭</div>
        <p>Nenhum projeto nesta categoria.</p>
        <button class="btn-primary" onclick="location.href='pub_vaga.html'">+ Publicar projeto</button>
      </div>`;
        return;
    }

    el.innerHTML = lista.map(j => {
        const tags = j.habilidades ? j.habilidades.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '';
        const orc = j.orcamento_min && j.orcamento_max
            ? `${fmtMoeda(j.orcamento_min)} – ${fmtMoeda(j.orcamento_max)}`
            : 'A combinar';

        return `
      <div class="job-card">
        <div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem">
            ${badgeStatus(j.status)} ${badgeModal(j.modalidade)}
            <span class="badge" style="background:var(--surface);color:var(--ink-mid)">${j.tipo}</span>
          </div>
          <div class="job-title">${j.titulo}</div>
          <div class="job-meta-row">
            <span class="meta-item">
              <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z"/>
              </svg>
              ${j.prazo_dias ? j.prazo_dias + ' dias' : '–'}
            </span>
            <span class="meta-item" style="color:var(--green);font-weight:500">${orc}</span>
            <span class="meta-item">${fmtRelativo(j.criado_em)}</span>
          </div>
          <div class="job-desc">${j.descricao}</div>
          <div class="job-tags">${tags}</div>
        </div>
        <div class="job-actions">
          <span class="propostas-count" onclick="abrirCandidatos(${j.id})">
            👥 ${j.total_propostas || 0} proposta${(j.total_propostas || 0) !== 1 ? 's' : ''}
          </span>
          ${j.status === 'aberta'
            ? `<button class="btn-sm btn-sm-outline" onclick="mudarStatus(${j.id},'pausada')">⏸ Pausar</button>`
            : j.status === 'pausada'
            ? `<button class="btn-sm btn-sm-primary" onclick="mudarStatus(${j.id},'aberta')">▶ Reativar</button>`
            : ''}
          ${j.status !== 'fechada' && j.status !== 'concluida' ? `<button class="btn-sm btn-sm-danger" onclick="mudarStatus(${j.id},'fechada')">Encerrar</button>` : ''}
        </div>
      </div>`;
    }).join('');
}

async function abrirCandidatos(jobId) {
    const job = jobs.find(j => j.id === jobId);
    document.getElementById('modal-cand-titulo').textContent = `Propostas — ${job?.titulo || ''}`;

    try {
        const propostas = await API.get(`/propostas/vaga/${jobId}`);
        const lista = document.getElementById('modal-cand-lista');

        if (propostas.length === 0) {
            lista.innerHTML = '<p style="color:var(--ink-light);font-size:.875rem">Nenhuma proposta recebida ainda.</p>';
        } else {
            lista.innerHTML = propostas.map(p => {
                const mediaStars = p.media_nota > 0
                    ? starsHTML(Math.round(p.media_nota)) + ` <span style="font-size:.75rem;color:#4A5568">${parseFloat(p.media_nota).toFixed(1)}</span>`
                    : '<span style="color:#718096;font-size:.8rem">Sem avaliações</span>';
                return `
                <div class="candidato-card">
                    <div class="cand-avatar" style="cursor:pointer" onclick="location.href='perfil_publico.html?id=${p.freelancer_id}'" title="Ver perfil">${iniciais(p.freelancer_nome)}</div>
                    <div class="cand-info">
                        <div class="cand-name" style="cursor:pointer" onclick="location.href='perfil_publico.html?id=${p.freelancer_id}'">${p.freelancer_nome} <span style="font-size:.75rem;color:#1A56DB">→ ver perfil</span></div>
                        <div class="cand-area">${p.area || '–'} · ${p.experiencia || '–'}</div>
                        <div class="cand-valor">💬 ${p.mensagem ? p.mensagem.substring(0, 80) + (p.mensagem.length > 80 ? '…' : '') : '–'}</div>
                        <div class="cand-valor" style="margin-top:.2rem">Proposta: <strong>${fmtMoeda(p.valor_proposto)}</strong> · ${p.prazo_proposto ? fmtData(p.prazo_proposto) : 'A combinar'}</div>
                        <div style="margin-top:.3rem;display:flex;align-items:center;gap:.3rem">${mediaStars}</div>
                    </div>
                    <div class="cand-actions">
                        ${p.status === 'pendente' ? `
                            <button class="btn-accept" onclick="responderProposta(${p.id},'aceita')">✓ Aceitar</button>
                            <button class="btn-reject" onclick="responderProposta(${p.id},'recusada')">✕</button>
                        ` : `<span class="badge badge-${p.status === 'aceita' ? 'aberta' : 'fechada'}">${p.status}</span>`}
                    </div>
                </div>`;
            }).join('');
        }
    } catch (e) {
        document.getElementById('modal-cand-lista').innerHTML =
            '<p style="color:#DC2626;font-size:.875rem">Erro ao carregar propostas.</p>';
    }

    document.getElementById('modal-cand').classList.add('open');
}

async function responderProposta(propId, status) {
    const msg = status === 'aceita' ? 'Aceitar esta proposta? Um contrato será criado automaticamente.' : 'Recusar esta proposta?';
    if (!confirm(msg)) return;
    try {
        await API.patch(`/propostas/${propId}/status`, { status });
        toast(status === 'aceita' ? 'Proposta aceita! Contrato criado.' : 'Proposta recusada.', status === 'aceita' ? 'success' : 'info');
        fecharModal('modal-cand');
        carregarJobs();
    } catch (e) { toast(e.mensagem || 'Erro.', 'error'); }
}

async function mudarStatus(jobId, status) {
    const msgs = { pausada: 'Pausar este projeto?', aberta: 'Reativar este projeto?', fechada: 'Encerrar este projeto?' };
    if (!confirm(msgs[status] || 'Confirmar?')) return;
    try {
        await API.patch(`/vagas/${jobId}/status`, { status });
        toast(`Status alterado para "${status}".`, 'info');
        carregarJobs();
    } catch (e) { toast(e.mensagem || 'Erro.', 'error'); }
}

function setTab(el, filtro) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filtroAtivo = filtro;
    renderJobs();
}

function fecharModal(id) { document.getElementById(id).classList.remove('open'); }
function fecharModalFora(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); }

async function carregarStats() {
    try {
        const s = await API.get('/stats/empresa');
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('stat-total',       s.total_projetos    || 0);
        set('stat-abertos',     s.projetos_abertos  || 0);
        set('stat-propostas',   s.total_propostas   || 0);
        set('stat-contratados', s.total_contratos   || 0);

        // Avaliação média na navbar do gráfico
        const notaEl = document.getElementById('dash-media-nota');
        if (notaEl && s.media_nota > 0) {
            notaEl.innerHTML = `${starsHTML(Math.round(s.media_nota))} <span style="color:#0E1726">${s.media_nota}</span> <span style="color:#718096;font-weight:400">(${s.total_avaliacoes} avaliações)</span>`;
        }

        // Gráfico de barras CSS
        renderGrafico(s.grafico_propostas || []);
    } catch (e) {
        // Fallback silencioso — atualizarStats() já calcula localmente a partir dos jobs
    }
}

function renderGrafico(dados) {
    const el = document.getElementById('chart-propostas');
    if (!el) return;
    if (!dados.length) {
        el.innerHTML = '<p style="color:#718096;font-size:.875rem;text-align:center;padding:.5rem">Nenhum projeto publicado ainda.</p>';
        return;
    }
    const max = Math.max(...dados.map(d => d.valor), 1);
    el.innerHTML = dados.map(d => {
        const pct = Math.round((d.valor / max) * 100);
        const cor = pct > 66 ? '#1A56DB' : pct > 33 ? '#6D28D9' : '#059669';
        return `
        <div style="display:flex;align-items:center;gap:.75rem">
          <div style="width:160px;font-size:.78rem;color:#4A5568;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0" title="${d.label}">${d.label}</div>
          <div style="flex:1;background:#F7F9FC;border-radius:6px;height:22px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${cor};border-radius:6px;
                        transition:width .8s cubic-bezier(.4,0,.2,1);
                        display:flex;align-items:center;justify-content:flex-end;padding-right:6px">
              ${d.valor > 0 ? `<span style="font-size:.7rem;font-weight:700;color:#fff">${d.valor}</span>` : ''}
            </div>
          </div>
          <div style="width:28px;text-align:right;font-size:.8rem;font-weight:600;color:#4A5568">${d.valor}</div>
        </div>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'empresa') { window.location.href = 'home.html'; return; }
    const elNome = document.getElementById('nome-empresa');
    if (elNome) elNome.textContent = Sessao.nome || 'Empresa';
    const av = document.getElementById('avatar-empresa');
    if (av) { av.textContent = iniciais(Sessao.nome); av.title = Sessao.nome || ''; }
    Notif.injetar('#nav-actions-dash');
    carregarStats();
    carregarJobs();
});
