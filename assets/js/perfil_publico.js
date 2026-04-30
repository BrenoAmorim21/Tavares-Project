// ============================================================
//  WorkFinder — assets/js/perfil_publico.js
//  Perfil público de freelancer (leitura) — ?id=<freelancer_id>
// ============================================================

let perfil = {};
let avaliacoes = [];

async function carregar() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { document.body.innerHTML = '<p style="padding:2rem;color:#DC2626">Freelancer não especificado.</p>'; return; }

    try {
        [perfil, avaliacoes] = await Promise.all([
            API.get(`/usuarios/freelancer/${id}`),
            API.get(`/avaliacoes/freelancer/${id}`)
        ]);
        renderTudo();
    } catch (e) {
        document.getElementById('perfil-wrap').innerHTML =
            '<p style="text-align:center;padding:3rem;color:#DC2626">Freelancer não encontrado.</p>';
    }
}

function renderTudo() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || '–'; };
    const setHTML = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v || ''; };

    set('pub-nome',    perfil.nome);
    set('pub-titulo',  perfil.area ? `${perfil.area}${perfil.experiencia ? ' · ' + perfil.experiencia : ''}` : 'Freelancer');
    set('pub-bio',     perfil.bio || 'Sem bio cadastrada.');
    set('pub-cidade',  perfil.cidade && perfil.estado ? `${perfil.cidade}, ${perfil.estado}` : 'Não informado');
    set('pub-portfolio', perfil.portfolio_url ? perfil.portfolio_url.replace('https://', '') : 'Não informado');
    set('pub-disponivel', perfil.disponivel ? 'Disponível para projetos' : 'Indisponível no momento');
    document.getElementById('pub-disponivel')?.classList.toggle('verde', !!perfil.disponivel);

    // Avatar
    const av = document.getElementById('pub-avatar');
    if (av) av.textContent = iniciais(perfil.nome);

    // Habilidades
    const skills = (perfil.habilidades || '').split(',').map(s => s.trim()).filter(Boolean);
    setHTML('pub-skills', skills.length
        ? skills.map(s => `<span class="pub-skill-tag">${s}</span>`).join('')
        : '<span style="color:#718096;font-size:.875rem">Nenhuma habilidade cadastrada.</span>');

    // Stats
    const media = perfil.media_nota ? parseFloat(perfil.media_nota).toFixed(1) : null;
    set('pub-stat-projetos', perfil.projetos_concluidos || 0);
    set('pub-stat-avaliacoes', perfil.total_avaliacoes || 0);
    if (media && media > 0) {
        const el = document.getElementById('pub-stat-nota');
        if (el) el.innerHTML = `${starsHTML(Math.round(parseFloat(media)), true)} ${media}`;
    }

    // Pretensão
    if (perfil.pretensao_hora) {
        set('pub-pretensao', `R$ ${Math.round(perfil.pretensao_hora)}/h`);
    }

    // Link de portfolio clicável
    if (perfil.portfolio_url) {
        const el = document.getElementById('pub-portfolio-link');
        if (el) { el.href = perfil.portfolio_url; el.target = '_blank'; }
    }

    // Avaliações
    renderAvaliacoes();

    document.title = `${perfil.nome} — WorkFinder`;
}

function renderAvaliacoes() {
    const el = document.getElementById('pub-avaliacoes');
    if (!el) return;

    if (!avaliacoes.length) {
        el.innerHTML = '<p style="color:#718096;font-size:.875rem">Nenhuma avaliação recebida ainda.</p>';
        return;
    }

    const media = (avaliacoes.reduce((a, v) => a + v.nota, 0) / avaliacoes.length).toFixed(1);
    el.innerHTML = `
        <div style="display:flex;align-items:center;gap:1.5rem;padding:1rem;background:#FFFBEB;border-radius:10px;margin-bottom:1rem;border:1px solid #FDE68A">
            <div style="text-align:center">
                <div style="font-size:2.5rem;font-weight:800;color:#F59E0B;line-height:1">${media}</div>
                <div class="stars-animated" style="font-size:1rem;margin:.25rem 0">${starsHTML(Math.round(parseFloat(media)), true)}</div>
                <div style="font-size:.75rem;color:#92400E">${avaliacoes.length} avaliação${avaliacoes.length !== 1 ? 'ões' : ''}</div>
            </div>
            <div style="flex:1">
                ${[5,4,3,2,1].map(n => {
                    const qty = avaliacoes.filter(a => a.nota === n).length;
                    const pct = Math.round(qty / avaliacoes.length * 100);
                    return `<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
                        <span style="font-size:.75rem;color:#92400E;width:10px">${n}</span>
                        <div style="flex:1;background:#FEF3C7;border-radius:4px;height:7px;overflow:hidden">
                            <div style="width:${pct}%;height:100%;background:#F59E0B;border-radius:4px"></div>
                        </div>
                        <span style="font-size:.72rem;color:#92400E;width:24px">${qty}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>
        ${avaliacoes.map((a, i) => `
        <div style="padding:.85rem 0;border-bottom:1px solid #F7F9FC;animation:fadeUp .3s ${i * 0.06}s ease both">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
                <div style="display:flex;align-items:center;gap:.5rem">
                    <div style="width:30px;height:30px;border-radius:50%;background:#EBF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700">${iniciais(a.avaliador_nome)}</div>
                    <span style="font-weight:600;font-size:.875rem">${a.avaliador_nome}</span>
                </div>
                <span class="stars-animated" style="font-size:.85rem">${starsHTML(a.nota, true)}</span>
            </div>
            ${a.comentario ? `<div style="font-size:.84rem;color:#4A5568;font-style:italic;margin-left:38px;line-height:1.5">"${a.comentario}"</div>` : ''}
            <div style="font-size:.74rem;color:#718096;margin-top:.25rem;margin-left:38px">${fmtRelativo(a.criado_em)}</div>
        </div>`).join('')}
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    carregar();
});
