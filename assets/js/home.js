// ============================================================
//  WorkFinder — assets/js/home.js
//  Feed de vagas reais via API com filtros funcionais
// ============================================================

let vagasCache   = [];
let filtroArea   = 'todos';   // chips de área (server-side)
let termoBusca   = '';
let filtroOrdem  = 'recentes';
let budgetMin    = 0;
let budgetMax    = 999999;

// Sets para checkboxes — iniciam com tudo marcado
let filtroModalidades = new Set(['remoto', 'presencial', 'hibrido']);
let filtroTipos       = new Set(['projeto', 'freelance', 'part-time']);
let filtroAreas       = new Set(['Desenvolvimento Web', 'Design Grafico / UI/UX', 'Desenvolvimento Mobile', 'Dados / BI', 'Marketing']);

// ── Carrega vagas do servidor ─────────────────────────────
async function carregarVagas() {
    const grid = document.getElementById('project-grid');
    grid.innerHTML = '<p style="text-align:center;color:#718096;padding:2rem">Carregando projetos...</p>';
    try {
        const p = new URLSearchParams();
        if (termoBusca) p.set('busca', termoBusca);
        // Área via chip usa filtro único; sidebar usa client-side
        if (filtroArea !== 'todos') p.set('area', filtroArea);
        vagasCache = await API.get('/vagas?' + p.toString());
        renderFeed();
    } catch (e) {
        grid.innerHTML = '<p style="text-align:center;color:#DC2626;padding:2rem">Erro ao carregar projetos. O servidor está rodando?</p>';
    }
}

// ── Filtragem client-side (modalidade, tipo, área sidebar, budget) ──
function filtrarLocal(vagas) {
    return vagas.filter(v => {
        if (!filtroModalidades.has(v.modalidade)) return false;
        if (!filtroTipos.has(v.tipo)) return false;
        if (filtroArea === 'todos' && filtroAreas.size < 5 && v.area && !filtroAreas.has(v.area)) return false;
        const orc = v.orcamento_min || 0;
        if (orc > 0 && (orc < budgetMin || orc > budgetMax)) return false;
        return true;
    });
}

// ── Ordenação ─────────────────────────────────────────────
function ordenar(vagas) {
    return [...vagas].sort((a, b) => {
        if (filtroOrdem === 'orcamento')  return (b.orcamento_max || 0) - (a.orcamento_max || 0);
        if (filtroOrdem === 'propostas')  return (a.total_propostas || 0) - (b.total_propostas || 0);
        return new Date(b.criado_em) - new Date(a.criado_em);
    });
}

// ── Atualiza contadores reais na sidebar ──────────────────
function atualizarContadores(vagas) {
    const cModal = {}, cTipo = {}, cArea = {};
    vagas.forEach(v => {
        cModal[v.modalidade] = (cModal[v.modalidade] || 0) + 1;
        cTipo[v.tipo]        = (cTipo[v.tipo]        || 0) + 1;
        if (v.area) cArea[v.area] = (cArea[v.area] || 0) + 1;
    });
    Object.entries(cModal).forEach(([k, n]) => {
        const el = document.querySelector(`[data-count-modal="${k}"]`);
        if (el) el.textContent = n;
    });
    Object.entries(cTipo).forEach(([k, n]) => {
        const el = document.querySelector(`[data-count-tipo="${k}"]`);
        if (el) el.textContent = n;
    });
    Object.entries(cArea).forEach(([k, n]) => {
        const el = document.querySelector(`[data-count-area="${k}"]`);
        if (el) el.textContent = n;
    });
}

// ── Render principal ──────────────────────────────────────
function renderFeed() {
    const grid   = document.getElementById('project-grid');
    const countEl = document.getElementById('feed-count');

    atualizarContadores(vagasCache);

    const filtradas = filtrarLocal(vagasCache);
    const ordenadas = ordenar(filtradas);

    if (countEl) {
        const n = ordenadas.length;
        countEl.textContent = `${n} projeto${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
    }

    grid.innerHTML = ordenadas.length === 0
        ? '<div class="empty-state"><div style="font-size:2.5rem">🔍</div><p>Nenhum projeto encontrado com estes filtros.</p></div>'
        : ordenadas.map(renderCard).join('');
}

// ── Card de vaga ──────────────────────────────────────────
function badgeModal(m) {
    const map   = { remoto: 'badge-remoto', presencial: 'badge-presencial', hibrido: 'badge-hibrido' };
    const label = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
    return `<span class="badge ${map[m] || ''}">${label[m] || m}</span>`;
}

function renderCard(v) {
    const tags = v.habilidades
        ? v.habilidades.split(',').map((t, i) => `<span class="tag ${i === 0 ? 'highlight' : ''}">${t.trim()}</span>`).join('')
        : '';
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

// ── Helpers ───────────────────────────────────────────────
function filterChip(el, area) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    filtroArea = area;
    carregarVagas();
}

function aplicarBudget(radio) {
    const [min, max] = radio.value.split(',').map(Number);
    budgetMin = min;
    budgetMax = max;
    renderFeed();
}

function abrirVaga(id) { window.location.href = `detal_vaga.html?id=${id}`; }

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();

    const nome = Sessao.nome || 'Usuário';
    const av = document.getElementById('avatar-home');
    if (av) av.textContent = iniciais(nome);

    // Injeta sino de notificações
    Notif.injetar('#nav-actions-home');

    // Checkboxes de modalidade, tipo e área
    document.querySelectorAll('[data-filter]').forEach(cb => {
        cb.addEventListener('change', () => {
            const tipo = cb.dataset.filter;
            const val  = cb.value;
            const set  = tipo === 'modalidade' ? filtroModalidades
                       : tipo === 'tipo'        ? filtroTipos
                       :                          filtroAreas;
            cb.checked ? set.add(val) : set.delete(val);
            renderFeed();
        });
    });

    // Busca com debounce
    document.getElementById('search-input')?.addEventListener('input', e => {
        termoBusca = e.target.value;
        clearTimeout(window._searchT);
        window._searchT = setTimeout(carregarVagas, 400);
    });

    carregarVagas();
});
