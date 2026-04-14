// WorkFinder — perfil_empresa.js (Perfil real + avaliações + proteção de rota)

let dadosPerfil = {};

async function carregarPerfil() {
    try {
        dadosPerfil = await API.get('/usuarios/perfil');
        await carregarAvaliacoes();
        renderPerfil();
    } catch (e) { toast('Erro ao carregar perfil.', 'error'); }
}

async function carregarAvaliacoes() {
    try {
        const perfil_id = localStorage.getItem('wf_perfil_id');
        if (!perfil_id) return;
        const avs = await API.get(`/avaliacoes/empresa/${perfil_id}`);
        renderAvaliacoes(avs);
        if (avs.length > 0) {
            const media = (avs.reduce((a, v) => a + v.nota, 0) / avs.length).toFixed(1);
            const el = document.getElementById('display-nota');
            if (el) el.textContent = `⭐ ${media} (${avs.length} avaliação${avs.length !== 1 ? 'ões' : ''})`;
        }
    } catch (e) { }
}

function renderAvaliacoes(avs) {
    const el = document.getElementById('secao-avaliacoes');
    if (!el) return;
    if (avs.length === 0) {
        el.innerHTML = '<p style="color:#718096;font-size:.875rem">Nenhuma avaliação ainda.</p>';
        return;
    }
    el.innerHTML = avs.map(a => `
    <div style="padding:.85rem 0;border-bottom:1px solid #E2E8F0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
        <span style="font-weight:600;font-size:.875rem">${a.avaliador_nome}</span>
        <span style="color:#D97706;font-size:.875rem">${'⭐'.repeat(a.nota)}</span>
      </div>
      ${a.comentario ? `<div style="font-size:.84rem;color:#4A5568;font-style:italic">"${a.comentario}"</div>` : ''}
      <div style="font-size:.75rem;color:#718096;margin-top:.25rem">${fmtRelativo(a.criado_em)}</div>
    </div>`).join('');
}

function renderPerfil() {
    const p = dadosPerfil;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
    set('display-nome-empresa', p.nome_empresa || Sessao.nome || '–');
    set('display-desc-empresa', p.descricao || 'Nenhuma descrição cadastrada.');
    set('display-setor', p.setor || '–');
    set('display-cidade', p.cidade && p.estado ? `${p.cidade}, ${p.estado}` : '–');
    set('display-tamanho', p.tamanho || '–');
    const av = document.getElementById('logo-iniciais'); if (av) av.textContent = iniciais(p.nome_empresa || Sessao.nome);
    const inp = id => document.getElementById(id);
    if (inp('inp-nome-empresa')) inp('inp-nome-empresa').value = p.nome_empresa || '';
    if (inp('inp-desc-empresa')) inp('inp-desc-empresa').value = p.descricao || '';
    if (inp('inp-setor')) inp('inp-setor').value = p.setor || '';
    if (inp('inp-cidade')) inp('inp-cidade').value = p.cidade || '';
    if (inp('inp-estado')) inp('inp-estado').value = p.estado || '';
    if (inp('inp-tamanho')) inp('inp-tamanho').value = p.tamanho || '';
}

async function salvarPerfil(e) {
    e.preventDefault();
    const get = id => document.getElementById(id)?.value?.trim();
    try {
        const upd = {
            ...dadosPerfil,
            nome_empresa: get('inp-nome-empresa'),
            descricao: get('inp-desc-empresa'),
            setor: get('inp-setor'),
            cidade: get('inp-cidade'),
            estado: get('inp-estado'),
            tamanho: get('inp-tamanho')
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