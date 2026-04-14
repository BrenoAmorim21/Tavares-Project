// WorkFinder — perfil-freelancer.js (Perfil real + avaliações + proteção de rota)

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
        const avs = await API.get(`/avaliacoes/freelancer/${perfil_id}`);
        renderAvaliacoes(avs);
        // Média
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
    set('display-nome', p.nome || Sessao.nome || '–');
    set('display-titulo', p.area ? `${p.area}${p.experiencia ? ' · ' + p.experiencia : ''}` : 'Freelancer');
    set('display-bio', p.bio || 'Nenhuma bio cadastrada ainda.');
    set('display-cidade', p.cidade && p.estado ? `${p.cidade}, ${p.estado}` : 'Localização não informada');
    const av = document.getElementById('avatar-iniciais'); if (av) av.textContent = iniciais(p.nome || Sessao.nome);
    // Preenche inputs dos modais
    const inp = id => document.getElementById(id);
    if (inp('input-nome')) inp('input-nome').value = p.nome || '';
    if (inp('input-titulo')) inp('input-titulo').value = p.area || '';
    if (inp('input-bio')) inp('input-bio').value = p.bio || '';
    if (inp('input-skills')) inp('input-skills').value = p.habilidades || '';
    renderSkills(p.habilidades || '');
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
            bio: document.getElementById('input-bio')?.value?.trim()
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
    carregarPerfil();
});