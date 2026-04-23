// ============================================================
//  WorkFinder — assets/js/perfil_empresa.js
//  Perfil da empresa — API real + avaliações animadas + projetos
// ============================================================

let dadosPerfil = {};
let avaliacoes = [];
let projetosEmpresa = [];

async function carregarPerfil() {
    try {
        dadosPerfil = await API.get('/usuarios/perfil');
        renderPerfil();
        await Promise.all([carregarAvaliacoes(), carregarProjetos()]);
    } catch (e) { toast('Erro ao carregar perfil.', 'error'); }
}

async function carregarAvaliacoes() {
    try {
        const perfil_id = localStorage.getItem('wf_perfil_id');
        if (!perfil_id) return;
        avaliacoes = await API.get(`/avaliacoes/empresa/${perfil_id}`);
        renderAvaliacoes();
        renderRatingSidebar();
    } catch (e) { }
}

async function carregarProjetos() {
    try {
        projetosEmpresa = await API.get('/vagas/meus');
        renderProjetos();
    } catch (e) { }
}

function renderRatingSidebar() {
    const ratingNum = document.querySelector('.rating-num');
    const ratingStars = document.querySelector('.rating-stars');
    const ratingSub = document.querySelector('.rating-sub');

    if (avaliacoes.length > 0) {
        const media = (avaliacoes.reduce((a, v) => a + v.nota, 0) / avaliacoes.length).toFixed(1);
        if (ratingNum) ratingNum.textContent = media;
        if (ratingStars) ratingStars.innerHTML = `<span class="stars-animated">${starsHTML(Math.round(parseFloat(media)), true)}</span>`;
        if (ratingSub) ratingSub.textContent = `Baseado em ${avaliacoes.length} avaliação${avaliacoes.length !== 1 ? 'ões' : ''}`;
    } else {
        if (ratingNum) ratingNum.textContent = '–';
        if (ratingStars) ratingStars.textContent = '';
        if (ratingSub) ratingSub.textContent = 'Nenhuma avaliação ainda';
    }
}

function renderAvaliacoes() {
    const container = document.querySelector('.section:has(.section-title:last-of-type)');
    // Find reviews section by looking for the correct header
    const sections = document.querySelectorAll('.section');
    let reviewSection = null;
    sections.forEach(s => {
        const title = s.querySelector('.section-title');
        if (title && title.textContent.includes('Avaliações')) reviewSection = s;
    });

    if (!reviewSection) return;

    // Keep header
    const header = reviewSection.querySelector('.section-header');
    reviewSection.innerHTML = '';
    if (header) reviewSection.appendChild(header);

    if (avaliacoes.length === 0) {
        reviewSection.innerHTML += '<p style="color:#718096;font-size:.875rem;margin-top:.75rem">Nenhuma avaliação recebida ainda.</p>';
        return;
    }

    avaliacoes.forEach((a, i) => {
        const div = document.createElement('div');
        div.className = 'review-item';
        div.style.animation = `fadeUp .35s ${i * 0.08}s ease both`;
        div.innerHTML = `
            <div class="review-header">
                <div class="review-avatar" style="background:#EBF2FF;color:#1A56DB">${iniciais(a.avaliador_nome)}</div>
                <div>
                    <div class="review-name">${a.avaliador_nome}</div>
                    <div class="review-date">${fmtRelativo(a.criado_em)}</div>
                </div>
                <div class="review-stars stars-animated" style="margin-left:auto;font-size:1rem">${starsHTML(a.nota, true)}</div>
            </div>
            ${a.comentario ? `<p class="review-text">"${a.comentario}"</p>` : ''}
        `;
        reviewSection.appendChild(div);
    });
}

function renderProjetos() {
    const sections = document.querySelectorAll('.section');
    let projSection = null;
    sections.forEach(s => {
        const title = s.querySelector('.section-title');
        if (title && title.textContent.includes('Projetos')) projSection = s;
    });

    if (!projSection || projetosEmpresa.length === 0) return;

    const header = projSection.querySelector('.section-header');
    projSection.innerHTML = '';
    if (header) projSection.appendChild(header);

    projetosEmpresa.forEach(j => {
        const statusBadge = j.status === 'aberta' ? 'badge-aberta' : '';
        const modBadge = { remoto: 'badge-remoto', hibrido: 'badge-hibrido', presencial: 'badge-presencial' }[j.modalidade] || '';
        const orc = j.orcamento_min && j.orcamento_max
            ? `${fmtMoeda(j.orcamento_min)} – ${fmtMoeda(j.orcamento_max)}`
            : 'A combinar';

        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="proj-meta">
                <span class="badge ${statusBadge}">${j.status.charAt(0).toUpperCase() + j.status.slice(1)}</span>
                <span class="badge ${modBadge}">${j.modalidade?.charAt(0).toUpperCase() + j.modalidade?.slice(1)}</span>
                <span class="budget-inline">${orc}</span>
            </div>
            <div class="proj-title" onclick="abrirProjeto(${j.id})">${j.titulo}</div>
            <div class="proj-desc">${j.descricao?.substring(0, 150)}${(j.descricao?.length || 0) > 150 ? '...' : ''} ${j.total_propostas || 0} propostas recebidas.</div>
        `;
        projSection.appendChild(div);
    });
}

function renderPerfil() {
    const p = dadosPerfil;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
    set('display-nome-empresa', p.nome_empresa || Sessao.nome || '–');
    set('display-desc-empresa', p.descricao || 'Nenhuma descrição cadastrada.');

    // Company logo
    const logo = document.querySelector('.company-logo-big');
    if (logo) logo.textContent = iniciais(p.nome_empresa || Sessao.nome);

    // Sector and location
    const sectorEl = document.querySelector('.company-sector');
    if (sectorEl) sectorEl.textContent = `${p.setor || 'Tecnologia'} · ${p.cidade || '–'}, ${p.estado || '–'}`;

    // Meta items
    const metaItems = document.querySelectorAll('.meta-item');
    if (metaItems.length >= 3) {
        metaItems[0].innerHTML = metaItems[0].querySelector('svg')?.outerHTML + ` ${p.cidade || '–'}, ${p.estado || '–'}`;
        metaItems[1].innerHTML = metaItems[1].querySelector('svg')?.outerHTML + ` ${p.tamanho || 'Não informado'}`;
    }

    // Verified badge
    if (p.verificada) {
        const badge = document.querySelector('.verified-badge');
        if (badge) badge.style.display = '';
    }

    // Modal inputs
    const inp = id => document.getElementById(id);
    if (inp('inp-nome-empresa')) inp('inp-nome-empresa').value = p.nome_empresa || '';
    if (inp('inp-desc-empresa')) inp('inp-desc-empresa').value = p.descricao || '';
}

async function salvarPerfil(e) {
    e.preventDefault();
    const get = id => document.getElementById(id)?.value?.trim();
    try {
        const upd = {
            ...dadosPerfil,
            nome_empresa: get('inp-nome-empresa'),
            descricao: get('inp-desc-empresa'),
        };
        await API.put('/usuarios/perfil', upd);
        dadosPerfil = upd;
        renderPerfil();
        fecharModal('modal-edit');
        toast('Perfil atualizado!');
    } catch (e) { toast(e.mensagem || 'Erro ao salvar.', 'error'); }
}

function setTab(el) { document.querySelectorAll('.company-nav-item').forEach(i => i.classList.remove('active')); el.classList.add('active'); }
function abrirModal(id) { document.getElementById(id)?.classList.add('open'); }
function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }
function fecharModalFora(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); }
function abrirProjeto(id) { window.location.href = `detal_vaga.html?id=${id}`; }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'empresa') { window.location.href = 'home.html'; return; }
    carregarPerfil();
});
