// ============================================================
//  WorkFinder — assets/js/contratos.js
//  Contratos do usuário — integrado com API real + avaliações
// ============================================================

let todosContratos = [];
let notaSelecionada = 0;
let contratoAvaliar = null;

async function carregarContratos() {
    try {
        todosContratos = await API.get('/contratos/meus');
        renderContratos();
    } catch (e) {
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('empty-state').innerHTML =
            '<div class="empty-icon">⚠️</div><p>Erro ao carregar contratos. O servidor está rodando?</p>';
    }
}

function renderContratos() {
    const andamento = todosContratos.filter(c => c.status === 'em_andamento');
    const concluidos = todosContratos.filter(c => c.status === 'concluido');
    const cancelados = todosContratos.filter(c => c.status === 'cancelado');

    // Banner ativo (primeiro contrato em andamento)
    const banner = document.getElementById('banner-ativo');
    if (andamento.length > 0) {
        const a = andamento[0];
        banner.classList.add('show');
        document.getElementById('banner-titulo').textContent = a.vaga_titulo;
        const parceiro = Sessao.tipo === 'empresa' ? a.freelancer_nome : a.nome_empresa;
        document.getElementById('banner-empresa').textContent = parceiro || '–';
        document.getElementById('banner-valor').textContent = a.valor_final ? fmtMoeda(a.valor_final) : 'A combinar';
        document.getElementById('banner-prazo').textContent = a.prazo_final || '–';
        document.getElementById('banner-inicio').textContent = fmtData(a.iniciado_em);

        const actions = document.getElementById('banner-actions');
        actions.innerHTML = `
            <button class="btn-banner btn-banner-green" onclick="concluirContrato(${a.id})">✓ Marcar concluído</button>
            <button class="btn-banner btn-banner-ghost" onclick="cancelarContrato(${a.id})">Cancelar</button>
        `;
    } else {
        banner.classList.remove('show');
    }

    // Seções
    renderSecao('secao-andamento', 'lista-andamento', andamento);
    renderSecao('secao-concluidos', 'lista-concluidos', concluidos);
    renderSecao('secao-cancelados', 'lista-cancelados', cancelados);

    // Empty state
    if (todosContratos.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
    }
}

function renderSecao(secaoId, listaId, items) {
    const secao = document.getElementById(secaoId);
    const lista = document.getElementById(listaId);
    if (items.length === 0) { secao.style.display = 'none'; return; }
    secao.style.display = 'block';

    lista.innerHTML = items.map((ct, i) => {
        const badgeCls = { em_andamento: 'badge-andamento', concluido: 'badge-concluido', cancelado: 'badge-cancelado' }[ct.status] || '';
        const badgeTxt = { em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado' }[ct.status] || ct.status;
        const parceiro = Sessao.tipo === 'empresa' ? ct.freelancer_nome : (ct.nome_empresa || '–');

        let actionsHTML = '';
        if (ct.status === 'em_andamento') {
            actionsHTML = `
                <button class="btn-ct btn-ct-green" onclick="concluirContrato(${ct.id})">✓ Concluir</button>
                <button class="btn-ct btn-ct-outline" onclick="cancelarContrato(${ct.id})">Cancelar</button>
            `;
        } else if (ct.status === 'concluido') {
            actionsHTML = ct.ja_avaliou
                ? `<span style="color:#059669;font-size:.8rem;font-weight:600;display:flex;align-items:center;gap:.3rem">
                       <span style="font-size:.95rem">⭐</span> Avaliado
                   </span>`
                : `<button class="btn-ct btn-ct-primary" onclick="abrirAvaliar(${ct.id})">⭐ Avaliar</button>`;
        }

        return `
        <div class="contrato-card ${ct.status}" style="animation-delay:${i * 0.04}s">
            <div class="ct-head">
                <div>
                    <div class="ct-titulo">${ct.vaga_titulo}</div>
                    <div class="ct-parceiro">${parceiro}</div>
                </div>
                <span class="badge ${badgeCls}">${badgeTxt}</span>
            </div>
            <div class="ct-meta">
                <span class="ct-meta-item">💰 <strong>${ct.valor_final ? fmtMoeda(ct.valor_final) : 'A combinar'}</strong></span>
                <span class="ct-meta-item">📅 Início: <strong>${fmtData(ct.iniciado_em)}</strong></span>
                ${ct.concluido_em ? `<span class="ct-meta-item">✅ Concluído: <strong>${fmtData(ct.concluido_em)}</strong></span>` : ''}
            </div>
            <div class="ct-actions">${actionsHTML}</div>
        </div>`;
    }).join('');
}

async function concluirContrato(id) {
    if (!confirm('Marcar este contrato como concluído?')) return;
    try {
        await API.patch(`/contratos/${id}/status`, { status: 'concluido' });
        toast('Contrato concluído! Agora você pode avaliar.', 'success');
        carregarContratos();
    } catch (e) { toast(e.mensagem || 'Erro ao concluir.', 'error'); }
}

async function cancelarContrato(id) {
    if (!confirm('Deseja cancelar este contrato?')) return;
    try {
        await API.patch(`/contratos/${id}/status`, { status: 'cancelado' });
        toast('Contrato cancelado.', 'info');
        carregarContratos();
    } catch (e) { toast(e.mensagem || 'Erro ao cancelar.', 'error'); }
}

// ── Avaliação com estrelas animadas ──────────────────────

function abrirAvaliar(contractId) {
    contratoAvaliar = contractId;
    notaSelecionada = 0;
    const ct = todosContratos.find(c => c.id === contractId);
    const parceiro = Sessao.tipo === 'empresa' ? ct?.freelancer_nome : (ct?.nome_empresa || '–');
    document.getElementById('avaliar-sub').textContent = `Como foi sua experiência com ${parceiro}?`;
    document.getElementById('avaliar-comentario').value = '';

    // Reset estrelas
    const estrelas = document.querySelectorAll('#estrelas .estrela');
    estrelas.forEach(e => e.classList.remove('on'));

    document.getElementById('modal-avaliar').classList.add('open');
}

function selecionarNota(n) {
    notaSelecionada = n;
    const estrelas = document.querySelectorAll('#estrelas .estrela');
    estrelas.forEach((e, i) => {
        if (i < n) {
            e.classList.add('on');
            // Animação bounce
            e.style.transform = 'scale(1.4)';
            e.style.transition = 'transform 0.15s ease';
            setTimeout(() => {
                e.style.transform = 'scale(1)';
            }, 150);
        } else {
            e.classList.remove('on');
        }
    });

    // Confetti effect se 5 estrelas
    if (n === 5) {
        criarConfetti();
    }
}

function criarConfetti() {
    const container = document.getElementById('estrelas');
    const colors = ['#F59E0B', '#FBBF24', '#FDE68A', '#F97316', '#EF4444', '#10B981'];
    for (let i = 0; i < 20; i++) {
        const conf = document.createElement('span');
        conf.style.cssText = `
            position:absolute;
            width:6px;height:6px;
            background:${colors[Math.floor(Math.random()*colors.length)]};
            border-radius:50%;
            pointer-events:none;
            left:${50 + (Math.random()-0.5)*120}%;
            top:50%;
            animation:confettiFly ${0.6+Math.random()*0.6}s ease-out forwards;
            z-index:10;
        `;
        container.style.position = 'relative';
        container.appendChild(conf);
        setTimeout(() => conf.remove(), 1200);
    }

    // Inject confetti keyframes if not exists
    if (!document.getElementById('confetti-style')) {
        const s = document.createElement('style');
        s.id = 'confetti-style';
        s.textContent = `
            @keyframes confettiFly {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(${Math.random()>0.5?'':'-'}${20+Math.random()*40}px, -${40+Math.random()*60}px) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(s);
    }
}

async function enviarAvaliacao() {
    if (notaSelecionada === 0) { toast('Selecione uma nota.', 'info'); return; }

    try {
        await API.post('/avaliacoes', {
            contract_id: contratoAvaliar,
            nota: notaSelecionada,
            comentario: document.getElementById('avaliar-comentario').value.trim()
        });
        toast('Avaliação enviada com sucesso! ⭐', 'success');
        fecharModal('modal-avaliar');
        carregarContratos();
    } catch (e) {
        toast(e.mensagem || 'Erro ao enviar avaliação.', 'error');
    }
}

function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();

    const homeLink = document.getElementById('nav-home-link');
    if (homeLink) homeLink.href = Sessao.tipo === 'empresa' ? 'dash_empresa.html' : 'home.html';

    Notif.injetar('.nav-actions');
    carregarContratos();
    setInterval(carregarContratos, 30000);
});
