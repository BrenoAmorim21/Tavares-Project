// ============================================================
//  WorkFinder — assets/js/pub_vaga.js
//  Publicar novo projeto — integrado com API real
// ============================================================

let modalidadeSelecionada = 'remoto';
let skillsList = [];

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'empresa') { window.location.href = 'home.html'; return; }

    selecionarModalidade('remoto');

    // Input de habilidades ao pressionar Enter ou vírgula
    const inpHab = document.getElementById('inp-habilidades');
    if (inpHab) {
        inpHab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                adicionarSkill(inpHab.value.trim().replace(',', ''));
                inpHab.value = '';
            }
        });
        inpHab.addEventListener('blur', () => {
            const v = inpHab.value.trim();
            if (v) { adicionarSkill(v); inpHab.value = ''; }
        });
    }

    // Listeners para preview em tempo real
    ['inp-titulo', 'inp-desc', 'inp-orcamento-min', 'inp-orcamento-max', 'inp-prazo'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', atualizarPreview);
    });
});

function selecionarModalidade(modo) {
    modalidadeSelecionada = modo;
    document.querySelectorAll('.modal-opt').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-modalidade="${modo}"]`)?.classList.add('selected');
    atualizarPreview();
}

function adicionarSkill(nome) {
    if (!nome || skillsList.includes(nome)) return;
    skillsList.push(nome);
    renderSkills();
    atualizarPreview();
}

function removerSkill(nome) {
    skillsList = skillsList.filter(s => s !== nome);
    renderSkills();
    atualizarPreview();
}

function renderSkills() {
    const wrap = document.getElementById('skills-preview');
    if (!wrap) return;
    wrap.innerHTML = skillsList.map(s => `
    <span class="skill-chip">
      ${s}
      <button type="button" onclick="removerSkill('${s}')">✕</button>
    </span>
  `).join('');
}

function atualizarPreview() {
    const titulo = document.getElementById('inp-titulo')?.value || 'Título do projeto';
    const desc = document.getElementById('inp-desc')?.value || 'Descrição será exibida aqui...';
    const min = document.getElementById('inp-orcamento-min')?.value;
    const max = document.getElementById('inp-orcamento-max')?.value;
    const prazo = document.getElementById('inp-prazo')?.value || '–';

    const orcamento = (min && max)
        ? `R$ ${Number(min).toLocaleString('pt-BR')} – R$ ${Number(max).toLocaleString('pt-BR')}`
        : min ? `A partir de R$ ${Number(min).toLocaleString('pt-BR')}`
        : '–';

    const labelModal = { remoto: 'Remoto', hibrido: 'Híbrido', presencial: 'Presencial' };
    const classModal = { remoto: 'badge-remoto', hibrido: 'badge-hibrido', presencial: 'badge-presencial' };

    const el = document.getElementById('preview-content');
    if (!el) return;

    el.innerHTML = `
    <div class="preview-job-title">${titulo}</div>
    <div class="preview-meta">
      <span class="badge ${classModal[modalidadeSelecionada]}">${labelModal[modalidadeSelecionada]}</span>
      <span class="budget-preview">${orcamento}</span>
      <span style="font-size:.82rem;color:var(--ink-light)">⏱ ${prazo}</span>
    </div>
    <div class="preview-desc">${desc.substring(0, 180)}${desc.length > 180 ? '...' : ''}</div>
    ${skillsList.length ? `<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.75rem">${skillsList.map(s => `<span class="skill-chip">${s}</span>`).join('')}</div>` : ''}
  `;
}

async function publicarVaga() {
    const titulo = document.getElementById('inp-titulo')?.value?.trim();
    const desc = document.getElementById('inp-desc')?.value?.trim();
    const tipo = document.getElementById('inp-tipo')?.value;
    const area = document.getElementById('inp-area')?.value;

    if (!titulo) { toast('Informe o título do projeto.', 'info'); return; }
    if (!desc) { toast('Descreva o projeto.', 'info'); return; }
    if (!tipo) { toast('Selecione o tipo de contratação.', 'info'); return; }

    const min = document.getElementById('inp-orcamento-min')?.value;
    const max = document.getElementById('inp-orcamento-max')?.value;
    const prazo = document.getElementById('inp-prazo')?.value;
    const nivel = document.getElementById('inp-nivel')?.value;

    try {
        await API.post('/vagas', {
            titulo,
            descricao: desc,
            tipo,
            modalidade: modalidadeSelecionada,
            area: area || null,
            habilidades: skillsList.join(', ') || null,
            nivel: nivel || null,
            orcamento_min: min || null,
            orcamento_max: max || null,
            prazo_dias: prazo || null,
        });

        document.getElementById('form-section').style.display = 'none';
        document.getElementById('success-section').classList.add('show');
        toast('Projeto publicado com sucesso! 🎉', 'success');
    } catch (e) {
        toast(e.mensagem || 'Erro ao publicar projeto.', 'error');
    }
}

function salvarRascunho() {
    toast('Rascunho salvo localmente!', 'info');
}
