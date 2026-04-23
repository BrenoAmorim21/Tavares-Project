// ============================================================
//  WorkFinder — assets/js/home.js
//  Feed de vagas reais via API com filtros funcionais
// ============================================================

let vagasCache = [];
let filtroArea = 'todos';
let termoBusca = '';

async function carregarVagas() {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = '<p style="text-align:center;color:#718096;padding:2rem">Carregando projetos...</p>';
    try {
        const p = new URLSearchParams();
        if (filtroArea !== 'todos') p.set('area', filtroArea);
        if (termoBusca) p.set('busca', termoBusca);
        vagasCache = await API.get('/vagas?' + p.toString());
        renderFeed();
    } catch (e) {
        grid.innerHTML = '<p style="text-align:center;color:#DC2626;padding:2rem">Erro ao carregar projetos. O servidor está rodando?</p>';
    }
}

function badgeModal(m) {
    const map = { remoto: 'badge-remoto', presencial: 'badge-presencial', hibrido: 'badge-hibrido' };
    const label = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
    return `<span class="badge ${map[m] || ''}">${label[m] || m}</span>`;
}

function renderCard(v) {
    const tags = v.habilidades ? v.habilidades.split(',').map((t, i) => `<span class="tag ${i === 0 ? 'highlight' : ''}">${t.trim()}</span>`).join('') : '';
    const orc = v.orcamento_min && v.orcamento_max
        ? `${fmtMoeda(v.orcamento_min)} – ${fmtMoeda(v.orcamento_max)}`
        : v.orcamento_min ? `A partir de ${fmtMoeda(v.orcamento_min)}` : 'A combinar';
    return `
    <div class="project-card" onclick="abrirVaga(${v.id})">
      <div class="card-top">
        <div class="company-info">
          <div class="company-logo">${iniciais(v.nome_empresa)}</div>
          <div>
            <div class="company-name">${v.nome_empresa}</div>
            ${v.verificada ? '<span class="company-badge">✓ Verificada</span>' : ''}
          </div>
        </div>
        <button class="card-bookmark" onclick="event.stopPropagation();this.classList.toggle('saved')" title="Salvar">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2Z"/></svg>
        </button>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.5rem">
        ${badgeModal(v.modalidade)}
        <span class="badge" style="background:#F7F9FC;color:#4A5568;border:1px solid #E2E8F0">${v.tipo}</span>
      </div>
      <div class="card-title">${v.titulo}</div>
      <div class="card-desc">${v.descricao}</div>
      <div class="card-tags">${tags}</div>
      <div class="card-footer">
        <div class="card-meta">
          <span class="budget">${orc}</span>
          <span class="meta-item">⏱ ${v.prazo_dias ? v.prazo_dias + ' dias' : 'A combinar'}</span>
          <span class="meta-item">👥 ${v.total_propostas || 0} proposta${v.total_propostas !== 1 ? 's' : ''}</span>
          <span class="meta-item">${fmtRelativo(v.criado_em)}</span>
        </div>
        <button class="btn-apply" onclick="event.stopPropagation();abrirVaga(${v.id})">Enviar proposta</button>
      </div>
    </div>`;
}

function renderFeed() {
    const grid = document.getElementById('project-grid');
    const el = document.getElementById('feed-count');
    if (el) el.textContent = `${vagasCache.length} projeto${vagasCache.length !== 1 ? 's' : ''} encontrado${vagasCache.length !== 1 ? 's' : ''}`;
    grid.innerHTML = vagasCache.length === 0
        ? '<div class="empty-state"><div style="font-size:2.5rem">🔍</div><p>Nenhum projeto encontrado.</p></div>'
        : vagasCache.map(renderCard).join('');
}

function filterChip(el, area) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    filtroArea = area;
    carregarVagas();
}

function abrirVaga(id) { window.location.href = `detal_vaga.html?id=${id}`; }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    const nome = Sessao.nome || 'Usuário';
    const av = document.querySelector('.avatar');
    if (av) av.textContent = iniciais(nome);
    carregarVagas();
    document.getElementById('search-input')?.addEventListener('input', e => {
        termoBusca = e.target.value;
        clearTimeout(window._t);
        window._t = setTimeout(carregarVagas, 400);
    });
});
