// ============================================================
//  WorkFinder — assets/js/perfil-freelancer.js
//  Perfil do freelancer — API real + avaliações animadas
// ============================================================

let dadosPerfil = {};
let avaliacoes = [];

async function carregarPerfil() {
    try {
        dadosPerfil = await API.get('/usuarios/perfil');
        renderPerfil();
        await Promise.all([carregarAvaliacoes(), carregarStatsReais()]);
    } catch (e) { toast('Erro ao carregar perfil.', 'error'); }
}

async function carregarStatsReais() {
    try {
        const s = await API.get('/stats/freelancer');
        const set = (idx, v) => {
            const els = document.querySelectorAll('.stat-value');
            if (els[idx]) els[idx].textContent = v;
        };
        set(0, s.propostas_enviadas  || 0);
        set(1, s.contratos_concluidos || 0);
        const taxa = s.taxa_aceite > 0 ? s.taxa_aceite + '%' : '–';
        set(2, taxa);
        if (dadosPerfil.pretensao_hora) set(3, `R$ ${Math.round(dadosPerfil.pretensao_hora)}`);
    } catch {}
}

async function carregarAvaliacoes() {
    try {
        const perfil_id = localStorage.getItem('wf_perfil_id');
        if (!perfil_id) return;
        avaliacoes = await API.get(`/avaliacoes/freelancer/${perfil_id}`);
        renderAvaliacoes();
        renderMediaNota();
    } catch (e) { }
}

function renderMediaNota() {
    if (avaliacoes.length === 0) return;
    const media = (avaliacoes.reduce((a, v) => a + v.nota, 0) / avaliacoes.length).toFixed(1);

    // Update stat in sidebar
    const statRows = document.querySelectorAll('.stat-row');
    if (statRows.length > 0) {
        // Find or create rating row
        let ratingRow = document.getElementById('rating-row');
        if (!ratingRow) {
            ratingRow = document.createElement('div');
            ratingRow.id = 'rating-row';
            ratingRow.className = 'stat-row';
            statRows[0].parentNode.insertBefore(ratingRow, statRows[0]);
        }
        ratingRow.innerHTML = `
            <span class="stat-label">Avaliação média</span>
            <span class="stat-value" style="color:#F59E0B;display:flex;align-items:center;gap:.3rem">
                ${starsHTML(Math.round(parseFloat(media)), true)} ${media}
            </span>
        `;
    }
}

function renderAvaliacoes() {
    const el = document.getElementById('secao-avaliacoes');
    if (!el) return;

    if (avaliacoes.length === 0) {
        el.innerHTML = '<p style="color:#718096;font-size:.875rem">Nenhuma avaliação ainda.</p>';
        return;
    }

    const media = (avaliacoes.reduce((a, v) => a + v.nota, 0) / avaliacoes.length).toFixed(1);

    el.innerHTML = `
        <div class="reviews-summary" style="text-align:center;padding:1rem 0;margin-bottom:1rem">
            <div style="font-size:2.2rem;font-weight:700;color:#F59E0B">${media}</div>
            <div class="stars-animated" style="font-size:1.3rem;margin:.3rem 0">${starsHTML(Math.round(parseFloat(media)), true)}</div>
            <div style="font-size:.82rem;color:#718096">${avaliacoes.length} avaliação${avaliacoes.length !== 1 ? 'ões' : ''}</div>
        </div>
        ${avaliacoes.map((a, i) => `
        <div class="review-card" style="padding:.85rem 0;border-bottom:1px solid #E2E8F0;animation:fadeUp .3s ${i * 0.06}s ease both">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem">
                <div style="display:flex;align-items:center;gap:.5rem">
                    <div style="width:28px;height:28px;border-radius:50%;background:#EBF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:600">${iniciais(a.avaliador_nome)}</div>
                    <span style="font-weight:600;font-size:.875rem">${a.avaliador_nome}</span>
                </div>
                <span class="stars-animated" style="font-size:.85rem">${starsHTML(a.nota, true)}</span>
            </div>
            ${a.comentario ? `<div style="font-size:.84rem;color:#4A5568;font-style:italic;margin-left:38px">"${a.comentario}"</div>` : ''}
            <div style="font-size:.75rem;color:#718096;margin-top:.25rem;margin-left:38px">${fmtRelativo(a.criado_em)}</div>
        </div>`).join('')}
    `;
}

function renderPerfil() {
    const p = dadosPerfil;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
    set('display-nome', p.nome || Sessao.nome || '–');
    set('display-titulo', p.area ? `${p.area}${p.experiencia ? ' · ' + p.experiencia : ''}` : 'Freelancer');
    set('display-bio', p.bio || 'Nenhuma bio cadastrada ainda.');

    // Avatar
    const avatarBig = document.querySelector('.avatar-big');
    if (avatarBig) avatarBig.childNodes[0].textContent = iniciais(p.nome || Sessao.nome);

    // Location and portfolio
    const metaItems = document.querySelectorAll('.profile-meta-item');
    if (metaItems.length >= 2) {
        metaItems[0].childNodes[2].textContent = p.cidade && p.estado ? ` ${p.cidade}, ${p.estado}` : ' Não informado';
        metaItems[1].childNodes[2].textContent = p.portfolio_url ? ` ${p.portfolio_url.replace('https://', '')}` : ' Não informado';
    }

    // Inputs dos modais
    const inp = id => document.getElementById(id);
    if (inp('input-nome')) inp('input-nome').value = p.nome || '';
    if (inp('input-titulo')) inp('input-titulo').value = p.area || '';
    if (inp('input-bio')) inp('input-bio').value = p.bio || '';
    if (inp('input-pretensao')) inp('input-pretensao').value = p.pretensao_hora || '';
    if (inp('input-skills')) inp('input-skills').value = p.habilidades || '';
    renderSkills(p.habilidades || '');

    // Stats
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 5) {
        statValues[4].textContent = p.atualizado_em ? fmtData(p.atualizado_em).substring(3) : 'Recente';
    }
    if (p.pretensao_hora && statValues.length >= 4) {
        statValues[3].textContent = `R$ ${Math.round(p.pretensao_hora)}`;
    }
}

function renderSkills(str) {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;
    const list = str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    grid.innerHTML = list.length
        ? list.map(s => `<div class="skill-tag">${s}</div>`).join('')
        : '<p style="color:#718096;font-size:.875rem">Nenhuma habilidade cadastrada.</p>';
}

async function salvarBio(e) {
    e.preventDefault();
    try {
        const upd = {
            ...dadosPerfil,
            nome: document.getElementById('input-nome')?.value?.trim(),
            area: document.getElementById('input-titulo')?.value?.trim(),
            bio: document.getElementById('input-bio')?.value?.trim(),
            pretensao_hora: document.getElementById('input-pretensao')?.value || null,
        };
        await API.put('/usuarios/perfil', upd);
        dadosPerfil = upd;
        renderPerfil();
        fecharModal('modal-bio');
        toast('Perfil atualizado!');
    } catch (e) { toast(e.mensagem || 'Erro ao salvar.', 'error'); }
}

async function salvarSkills(e) {
    e.preventDefault();
    const habilidades = document.getElementById('input-skills')?.value?.trim();
    try {
        await API.put('/usuarios/perfil', { ...dadosPerfil, habilidades });
        dadosPerfil.habilidades = habilidades;
        renderSkills(habilidades);
        fecharModal('modal-skills');
        toast('Habilidades atualizadas!');
    } catch (e) { toast(e.mensagem || 'Erro ao salvar.', 'error'); }
}

function abrirModal(id) { document.getElementById(id)?.classList.add('open'); }
function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }
function fecharModalFora(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); }
function setTab(el) { document.querySelectorAll('.profile-nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'freelancer') { window.location.href = 'dash_empresa.html'; return; }
    Notif.injetar('.nav-actions');
    carregarPerfil();
});
