// WorkFinder — detal_vaga.js (Detalhe de vaga + enviar proposta via API)

let vagaAtual = null;

async function carregarVaga() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { document.body.innerHTML = '<p style="padding:2rem;color:#DC2626">Vaga não encontrada.</p>'; return; }
    try {
        vagaAtual = await API.get(`/vagas/${id}`);
        renderVaga();
    } catch (e) {
        document.body.innerHTML = '<p style="padding:2rem;color:#DC2626">Erro ao carregar vaga.</p>';
    }
}

function renderVaga() {
    const v = vagaAtual;
    const orc = v.orcamento_min && v.orcamento_max
        ? `${fmtMoeda(v.orcamento_min)} – ${fmtMoeda(v.orcamento_max)}`
        : v.orcamento_min ? `A partir de ${fmtMoeda(v.orcamento_min)}` : 'A combinar';

    const el = id => document.getElementById(id);
    if (el('vaga-titulo')) el('vaga-titulo').textContent = v.titulo;
    if (el('vaga-empresa')) el('vaga-empresa').textContent = v.nome_empresa;
    if (el('vaga-desc')) el('vaga-desc').textContent = v.descricao;
    if (el('vaga-orc')) el('vaga-orc').textContent = orc;
    if (el('vaga-prazo')) el('vaga-prazo').textContent = v.prazo_dias ? `${v.prazo_dias} dias` : 'A combinar';
    if (el('vaga-modal')) el('vaga-modal').textContent = v.modalidade;
    if (el('vaga-propostas')) el('vaga-propostas').textContent = `${v.total_propostas || 0} propostas`;
    if (el('vaga-data')) el('vaga-data').textContent = fmtRelativo(v.criado_em);
    if (el('hint-orc')) el('hint-orc').textContent = `Faixa: ${orc}`;

    if (v.habilidades && el('vaga-tags')) {
        el('vaga-tags').innerHTML = v.habilidades.split(',').map(t =>
            `<span class="tag">${t.trim()}</span>`).join('');
    }

    // Oculta botão de proposta se for empresa
    if (Sessao.tipo === 'empresa') {
        el('form-proposta')?.style && (el('form-proposta').style.display = 'none');
    }
}

async function enviarProposta() {
    const valor = document.getElementById('inp-valor')?.value;
    const prazo = document.getElementById('inp-prazo-prop')?.value;
    const msg = document.getElementById('inp-msg')?.value?.trim();

    if (!valor) { toast('Informe o valor da sua proposta.', 'error'); return; }
    if (!prazo) { toast('Informe o prazo que consegue entregar.', 'error'); return; }
    if (!msg) { toast('Escreva uma mensagem para a empresa.', 'error'); return; }
    if (!vagaAtual) return;

    const btn = document.querySelector('.btn-send');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

    try {
        await API.post('/propostas', {
            job_id: vagaAtual.id,
            mensagem: msg,
            valor_proposto: Number(valor),
            prazo_proposto: Number(prazo.replace(/\D/g, '')) || null,
        });
        document.getElementById('form-proposta').style.display = 'none';
        document.getElementById('success-prop')?.classList.add('show');
        toast('Proposta enviada com sucesso! 🚀');
    } catch (e) {
        toast(e.mensagem || 'Erro ao enviar proposta.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '🚀 Enviar proposta'; }
    }
}

function salvarVaga(btn) {
    btn.textContent = '✅ Salvo!';
    setTimeout(() => btn.textContent = '🔖 Salvar para depois', 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    carregarVaga();
});