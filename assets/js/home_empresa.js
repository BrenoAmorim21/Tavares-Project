// ============================================================
//  WorkFinder — assets/js/home_empresa.js
//  Home da empresa: lista de freelancers para explorar.
// ============================================================

let freelancersCache = [];
let filtroArea = '';
let termoBusca = '';

async function carregarFreelancers() {
    const grid = document.getElementById('freelancer-grid');
    grid.innerHTML = '<p style="text-align:center;color:#718096;padding:2rem">Carregando freelancers...</p>';

    try {
        const p = new URLSearchParams();
        if (filtroArea) p.set('area', filtroArea);
        if (termoBusca) p.set('busca', termoBusca);
        freelancersCache = await API.get('/usuarios/freelancers?' + p.toString());
        renderFeed();
    } catch (e) {
        grid.innerHTML = '<p style="text-align:center;color:#DC2626;padding:2rem">Erro ao carregar freelancers. O servidor está rodando?</p>';
    }
}

function renderFeed() {
    const grid = document.getElementById('freelancer-grid');
    const countEl = document.getElementById('feed-count');

    if (countEl) {
        const n = freelancersCache.length;
        countEl.textContent = `${n} freelancer${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}`;
    }

    if (freelancersCache.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div style="font-size:2.5rem">🔍</div><p>Nenhum freelancer encontrado com estes filtros.</p></div>';
        return;
    }

    grid.innerHTML = freelancersCache.map(renderCard).join('');
}

function renderCard(f) {
    const inic = (f.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const skills = f.habilidades
        ? f.habilidades.split(',').slice(0, 5).map(s => `<span class="free-skill">${s.trim()}</span>`).join('')
        : '';
    const taxa = f.pretensao_hora ? `R$ ${Math.round(f.pretensao_hora)}/h` : 'A combinar';
    const rating = parseFloat(f.media_nota) > 0
        ? `<span class="free-rating">★ ${f.media_nota}</span> <span style="color:#718096">(${f.total_avaliacoes})</span>`
        : '<span style="color:#718096">Sem avaliações</span>';
    const badge = f.disponivel
        ? '<span class="badge-disponivel">● Disponível</span>'
        : '<span class="badge-indisponivel">Indisponível</span>';

    return `
    <div class="freelancer-card" onclick="location.href='perfil_publico.html?id=${f.id}'">
      <div class="free-head">
        <div class="free-avatar">${inic}</div>
        <div style="flex:1;min-width:0">
          <div class="free-name">${f.nome}</div>
          <div class="free-area">${f.area || 'Freelancer'}${f.experiencia ? ' · ' + f.experiencia : ''}</div>
        </div>
        ${badge}
      </div>
      ${f.bio ? `<div class="free-bio">${f.bio}</div>` : ''}
      ${skills ? `<div class="free-skills">${skills}</div>` : ''}
      <div class="free-footer">
        <span class="free-rate">${taxa}</span>
        <span>${rating}</span>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'empresa') { window.location.href = 'home.html'; return; }

    // Filtros de área
    document.querySelectorAll('input[name="area-filter"]').forEach(r => {
        r.addEventListener('change', () => {
            filtroArea = r.value;
            carregarFreelancers();
        });
    });

    // Busca com debounce
    document.getElementById('search-input')?.addEventListener('input', e => {
        termoBusca = e.target.value;
        clearTimeout(window._searchT);
        window._searchT = setTimeout(carregarFreelancers, 400);
    });

    carregarFreelancers();
});