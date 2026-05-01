// ============================================================
//  WorkFinder — assets/js/perfil_empresa.js
// ============================================================

let dadosPerfil = {};
let avaliacoes = [];
let projetosEmpresa = [];

async function carregarPerfil() {
    try {
        dadosPerfil = await API.get('/usuarios/perfil');
        renderPerfil();
        await Promise.all([carregarAvaliacoes(), carregarProjetos(), carregarStatsReais()]);
    } catch (e) { toast('Erro ao carregar perfil.', 'error'); }
}

async function carregarStatsReais() {
    try {
        const s = await API.get('/stats/empresa');
        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('ep-stat-projetos', s.total_projetos || 0);
        set('ep-stat-contratos', s.total_contratos || 0);
        set('ep-stat-propostas', s.total_propostas || 0);
        set('ep-stat-taxa', s.total_contratos > 0
            ? Math.round((s.total_contratos / s.total_projetos) * 100) + '%'
            : '–');
        if (dadosPerfil.criado_em) {
            set('ep-stat-membro', fmtData(dadosPerfil.criado_em).substring(3));
        }
    } catch (e) { }
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
    const sections = document.querySelectorAll('.section');
    let reviewSection = null;
    sections.forEach(s => {
        const title = s.querySelector('.section-title');
        if (title && title.textContent.includes('Avaliações')) reviewSection = s;
    });
    if (!reviewSection) return;

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
    if (!projSection) return;

    const header = projSection.querySelector('.section-header');
    projSection.innerHTML = '';
    if (header) projSection.appendChild(header);

    if (projetosEmpresa.length === 0) {
        projSection.innerHTML += '<p style="color:#718096;font-size:.875rem;margin-top:.75rem">Nenhum projeto publicado ainda.</p>';
        return;
    }

    projetosEmpresa.forEach(j => {
        const statusCls = j.status === 'aberta' ? 'badge-aberta' : 'badge-fechada';
        const modCls = { remoto: 'badge-remoto', hibrido: 'badge-hibrido', presencial: 'badge-presencial' }[j.modalidade] || '';
        const orc = j.orcamento_min && j.orcamento_max
            ? `${fmtMoeda(j.orcamento_min)} – ${fmtMoeda(j.orcamento_max)}`
            : 'A combinar';

        const div = document.createElement('div');
        div.className = 'project-item';
        div.innerHTML = `
            <div class="proj-meta">
                <span class="badge ${statusCls}">${j.status.charAt(0).toUpperCase() + j.status.slice(1)}</span>
                <span class="badge ${modCls}">${j.modalidade?.charAt(0).toUpperCase() + j.modalidade?.slice(1)}</span>
                <span class="budget-inline">${orc}</span>
            </div>
            <div class="proj-title" onclick="abrirProjeto(${j.id})">${j.titulo}</div>
            <div class="proj-desc">${(j.descricao || '').substring(0, 150)}${(j.descricao?.length || 0) > 150 ? '...' : ''} &nbsp;·&nbsp; ${j.total_propostas || 0} proposta${(j.total_propostas || 0) !== 1 ? 's' : ''} recebida${(j.total_propostas || 0) !== 1 ? 's' : ''}.</div>
        `;
        projSection.appendChild(div);
    });
}

function renderPerfil() {
    const p = dadosPerfil;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
    set('display-nome-empresa', p.nome_empresa || Sessao.nome || '–');
    set('display-desc-empresa', p.descricao || 'Nenhuma descrição cadastrada.');

    const logo = document.querySelector('.company-logo-big');
    if (logo) logo.textContent = iniciais(p.nome_empresa || Sessao.nome);

    const sectorEl = document.querySelector('.company-sector');
    if (sectorEl) sectorEl.textContent = `${p.setor || 'Tecnologia'} · ${p.cidade || '–'}, ${p.estado || '–'}`;

    const metaItems = document.querySelectorAll('.meta-item');
    if (metaItems.length >= 2) {
        const svg0 = metaItems[0].querySelector('svg')?.outerHTML || '';
        const svg1 = metaItems[1].querySelector('svg')?.outerHTML || '';
        metaItems[0].innerHTML = svg0 + ` ${p.cidade && p.estado ? p.cidade + ', ' + p.estado : 'Não informado'}`;
        metaItems[1].innerHTML = svg1 + ` ${p.tamanho || 'Não informado'}`;
    }

    if (p.verificada) {
        const badge = document.querySelector('.verified-badge');
        if (badge) badge.style.display = '';
    }

    // Preencher modal
    const inp = id => document.getElementById(id);
    if (inp('inp-nome-empresa')) inp('inp-nome-empresa').value = p.nome_empresa || '';
    if (inp('inp-desc-empresa')) inp('inp-desc-empresa').value = p.descricao || '';
    if (inp('inp-setor')) inp('inp-setor').value = p.setor || '';
    if (inp('inp-cidade')) inp('inp-cidade').value = p.cidade && p.estado ? `${p.cidade}, ${p.estado}` : '';
    if (inp('inp-site')) inp('inp-site').value = p.site_url || '';
}

async function salvarPerfil(e) {
    e.preventDefault();
    const get = id => document.getElementById(id)?.value?.trim() || null;
    const cidadeEstado = get('inp-cidade');
    let cidade = null, estado = null;
    if (cidadeEstado) {
        const partes = cidadeEstado.split(',').map(s => s.trim());
        cidade = partes[0] || null;
        estado = partes[1] || null;
    }
    try {
        const upd = {
            ...dadosPerfil,
            nome_empresa: get('inp-nome-empresa'),
            descricao: get('inp-desc-empresa'),
            setor: get('inp-setor'),
            site_url: get('inp-site'),
            cidade, estado,
        };
        await API.put('/usuarios/perfil', upd);
        dadosPerfil = upd;
        renderPerfil();
        fecharModal('modal-edit');
        toast('Perfil atualizado!');
    } catch (e) { toast(e.mensagem || 'Erro ao salvar.', 'error'); }
}

function setTab(el, tab) {
    document.querySelectorAll('.company-nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('tab-visao').style.display = tab === 'visao' ? '' : 'none';
    document.getElementById('tab-projetos').style.display = tab === 'projetos' ? '' : 'none';
    document.getElementById('tab-avaliacoes').style.display = tab === 'avaliacoes' ? '' : 'none';
}
function abrirModal(id) { document.getElementById(id)?.classList.add('open'); }
function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }
function fecharModalFora(e) { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); }
function abrirProjeto(id) { window.location.href = `detal_vaga.html?id=${id}`; }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'empresa') { window.location.href = 'home.html'; return; }
    Notif.injetar('#nav-actions-empresa');
    carregarPerfil();
});