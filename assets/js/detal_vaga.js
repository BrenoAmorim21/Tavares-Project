// ============================================================
//  WorkFinder — assets/js/detal_vaga.js
//  Detalhe da vaga — carrega dados reais + envia proposta via API
// ============================================================

let vagaAtual = null;

async function carregarVaga() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { toast('Vaga não especificada.', 'error'); return; }

    try {
        vagaAtual = await API.get(`/vagas/${id}`);
        renderVaga();
    } catch (e) {
        document.querySelector('.layout').innerHTML =
            '<p style="text-align:center;color:#DC2626;padding:3rem">Vaga não encontrada ou servidor offline.</p>';
    }
}

function renderVaga() {
    const v = vagaAtual;

    // Titulo e empresa
    const titleEl = document.querySelector('.job-title-main');
    if (titleEl) titleEl.textContent = v.titulo;

    const companyLink = document.querySelector('.company-link');
    if (companyLink) {
        companyLink.textContent = `${v.nome_empresa} ${v.verificada ? '✓' : ''}`;
        companyLink.onclick = () => location.href = `perfil_empresa.html?id=${v.company_id}`;
    }

    // Logo
    const logo = document.querySelector('.job-header .company-logo');
    if (logo) {
        logo.textContent = iniciais(v.nome_empresa);
        logo.style.background = '#EBF2FF';
        logo.style.color = '#1A56DB';
    }

    // Breadcrumb
    const breadcrumbs = document.querySelectorAll('.breadcrumb span');
    if (breadcrumbs.length >= 3) {
        breadcrumbs[2].textContent = v.area || 'Projeto';
        if (breadcrumbs[4]) breadcrumbs[4].textContent = v.titulo.substring(0, 40) + (v.titulo.length > 40 ? '...' : '');
    }

    // Badges
    const badgesRow = document.querySelector('.badges-row');
    if (badgesRow) {
        const statusBadge = v.status === 'aberta' ? 'badge-aberta' : 'badge-fechada';
        const modalBadge = { remoto: 'badge-remoto', presencial: 'badge-presencial', hibrido: 'badge-hibrido' }[v.modalidade] || '';
        badgesRow.innerHTML = `
            <span class="badge ${statusBadge}">${v.status.charAt(0).toUpperCase() + v.status.slice(1)}</span>
            <span class="badge ${modalBadge}">${v.modalidade?.charAt(0).toUpperCase() + v.modalidade?.slice(1)}</span>
            <span class="badge" style="background:var(--surface);color:var(--ink-mid)">${v.tipo}</span>
            ${v.area ? `<span class="badge" style="background:var(--surface);color:var(--ink-mid)">${v.area}</span>` : ''}
        `;
    }

    // Meta grid
    const orc = v.orcamento_min && v.orcamento_max
        ? `${fmtMoeda(v.orcamento_min)} – ${fmtMoeda(v.orcamento_max)}`
        : v.orcamento_min ? `A partir de ${fmtMoeda(v.orcamento_min)}` : 'A combinar';

    const metaCells = document.querySelectorAll('.meta-cell');
    if (metaCells.length >= 6) {
        metaCells[0].querySelector('.meta-val').textContent = orc;
        metaCells[1].querySelector('.meta-val').textContent = v.prazo_dias ? `${v.prazo_dias} dias` : 'A combinar';
        metaCells[2].querySelector('.meta-val').textContent = `${v.total_propostas || 0} propostas`;
        metaCells[3].querySelector('.meta-val').textContent = fmtRelativo(v.criado_em);
        metaCells[4].querySelector('.meta-val').textContent = v.nivel || 'Qualquer nível';
        metaCells[5].querySelector('.meta-val').textContent = v.deadline ? fmtData(v.deadline) : 'Sem limite';
    }

    // Habilidades
    const tagsEl = document.querySelector('.tags');
    if (tagsEl && v.habilidades) {
        tagsEl.innerHTML = v.habilidades.split(',').map((t, i) =>
            `<span class="tag ${i < 3 ? 'highlight' : ''}">${t.trim()}</span>`
        ).join('');
    }

    // Descrição
    const descBody = document.querySelector('.desc-body');
    if (descBody) descBody.innerHTML = v.descricao.replace(/\n/g, '<br>');

    // Sobre a empresa
    const empDesc = document.querySelectorAll('.desc-body')[1];
    if (empDesc) empDesc.textContent = v.empresa_descricao || `${v.nome_empresa} é uma empresa verificada na plataforma WorkFinder.`;

    // Propostas info
    const propInfo = document.querySelector('.propostas-info');
    if (propInfo) {
        propInfo.innerHTML = `<strong>${v.total_propostas || 0} freelancers</strong> já enviaram propostas para este projeto`;
    }

    // Form hint de faixa
    const formHint = document.querySelector('.form-hint');
    if (formHint && v.orcamento_min && v.orcamento_max) {
        formHint.textContent = `Faixa estimada: ${fmtMoeda(v.orcamento_min)} – ${fmtMoeda(v.orcamento_max)}`;
    }

    // Sidebar empresa card
    const cname = document.querySelector('.cname');
    if (cname) cname.textContent = v.nome_empresa;
    const csub = document.querySelector('.csub');
    if (csub) csub.textContent = `${v.empresa_cidade || '–'} · ${v.area || 'Tecnologia'}`;
    const clogo = document.querySelector('.clogo');
    if (clogo) clogo.textContent = iniciais(v.nome_empresa);

    // Hide form if not freelancer or job closed
    if (Sessao.tipo !== 'freelancer' || v.status !== 'aberta') {
        const form = document.getElementById('form-proposta');
        if (form) {
            form.innerHTML = v.status !== 'aberta'
                ? '<p style="text-align:center;color:var(--ink-light);padding:1rem">Esta vaga não está mais aceitando propostas.</p>'
                : '<p style="text-align:center;color:var(--ink-light);padding:1rem">Faça login como freelancer para enviar propostas.</p>';
        }
    }

    // Title
    document.title = `${v.titulo} — WorkFinder`;
}

async function enviarProposta() {
    if (!vagaAtual) return;
    const valor = document.getElementById('inp-valor')?.value;
    const prazo = document.getElementById('inp-prazo-prop')?.value;
    const msg = document.getElementById('inp-msg')?.value?.trim();

    if (!msg) { toast('Escreva uma mensagem para a empresa.', 'info'); return; }

    try {
        await API.post('/propostas', {
            job_id: vagaAtual.id,
            mensagem: msg,
            valor_proposto: valor || null,
            prazo_proposto: prazo || null
        });

        document.getElementById('form-proposta').style.display = 'none';
        document.getElementById('success-prop').classList.add('show');
        toast('Proposta enviada com sucesso! 🚀', 'success');
    } catch (e) {
        toast(e.mensagem || 'Erro ao enviar proposta.', 'error');
    }
}

function salvarVaga(btn) {
    btn.textContent = '✅ Salvo!';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => {
        btn.textContent = '🔖 Salvar para depois';
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    carregarVaga();
});
