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
        const parceiroEscB = (parceiro || '').replace(/'/g, "\\'");
        const tituloEscB = a.vaga_titulo.replace(/'/g, "\\'");
        actions.innerHTML = `
            <button class="btn-banner btn-banner-ghost" onclick="abrirChat(${a.id}, '${tituloEscB}', '${parceiroEscB}')">💬 Chat</button>
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
            const parceiroEsc = parceiro.replace(/'/g, "\\'");
            const tituloEsc = ct.vaga_titulo.replace(/'/g, "\\'");
            actionsHTML = `
                <button class="btn-chat" onclick="abrirChat(${ct.id}, '${tituloEsc}', '${parceiroEsc}')">💬 Chat</button>
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
            background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:50%;
            pointer-events:none;
            left:${50 + (Math.random() - 0.5) * 120}%;
            top:50%;
            animation:confettiFly ${0.6 + Math.random() * 0.6}s ease-out forwards;
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
                100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 40}px, -${40 + Math.random() * 60}px) scale(0); opacity: 0; }
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
    // Ajusta navbar conforme tipo de usuário
    const b1 = document.getElementById('btn-nav-1');
    const b2 = document.getElementById('btn-nav-2');
    if (Sessao.tipo === 'empresa') {
        b1.textContent = 'Dashboard'; b1.onclick = () => location.href = 'dash_empresa.html';
        b2.textContent = 'Publicar projeto'; b2.onclick = () => location.href = 'pub_vaga.html';
    } else {
        b1.textContent = 'Explorar projetos'; b1.onclick = () => location.href = 'home.html';
        b2.textContent = 'Meu perfil'; b2.onclick = () => location.href = 'perfil-freelancer.html';
    }

    const homeLink = document.getElementById('nav-home-link');
    if (homeLink) homeLink.href = Sessao.tipo === 'empresa' ? 'dash_empresa.html' : 'home.html';

    Notif.injetar('#nav-notif-slot');
    carregarContratos();
    setInterval(carregarContratos, 30000);
});

// ============================================================
//  CHAT — frontend
// ============================================================
let chatContractId = null;
let chatPollTimer = null;
let chatLastMsgId = 0;

async function abrirChat(contractId, vagaTitulo, parceiro) {
    chatContractId = contractId;
    chatLastMsgId = 0;
    document.getElementById('chat-title').textContent = parceiro;
    document.getElementById('chat-subtitle').textContent = vagaTitulo;
    document.getElementById('chat-body').innerHTML = '<div class="chat-empty">Carregando...</div>';
    document.getElementById('chat-overlay').classList.add('open');
    document.getElementById('chat-input').value = '';

    await carregarMensagens();
    marcarLidas();
    iniciarPolling();
    setTimeout(() => document.getElementById('chat-input').focus(), 100);
}

function fecharChat() {
    document.getElementById('chat-overlay').classList.remove('open');
    pararPolling();
    chatContractId = null;
}

function fecharChatFora(e) {
    if (e.target.id === 'chat-overlay') fecharChat();
}

async function carregarMensagens() {
    if (!chatContractId) return;
    try {
        const msgs = await API.get(`/mensagens/${chatContractId}`);
        renderMensagens(msgs);
        if (msgs.length > 0) chatLastMsgId = msgs[msgs.length - 1].id;
    } catch (e) {
        document.getElementById('chat-body').innerHTML =
            '<div class="chat-empty" style="color:#DC2626">Erro ao carregar mensagens.</div>';
    }
}

function renderMensagens(msgs) {
    const body = document.getElementById('chat-body');
    if (!msgs || msgs.length === 0) {
        body.innerHTML = '<div class="chat-empty">Nenhuma mensagem ainda. Diga olá! 👋</div>';
        return;
    }
    body.innerHTML = msgs.map(m => {
        const cls = m.eu_enviei ? 'chat-msg-mine' : 'chat-msg-theirs';
        const hora = new Date(m.criado_em.replace(' ', 'T')).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const conteudoEscapado = (m.conteudo || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div class="chat-msg ${cls}">${conteudoEscapado}<div class="chat-msg-time">${hora}</div></div>`;
    }).join('');
    body.scrollTop = body.scrollHeight;
}

async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send');
    const conteudo = input.value.trim();
    if (!conteudo || !chatContractId) return;

    btn.disabled = true;
    try {
        await API.post(`/mensagens/${chatContractId}`, { conteudo });
        input.value = '';
        input.style.height = 'auto';
        await carregarMensagens();
    } catch (e) {
        toast(e.mensagem || 'Erro ao enviar mensagem.', 'erro');
    } finally {
        btn.disabled = false;
        input.focus();
    }
}

function chatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensagem();
    }
}

async function marcarLidas() {
    if (!chatContractId) return;
    try { await API.post(`/mensagens/${chatContractId}/lidas`, {}); } catch (e) { /* silencioso */ }
}

function iniciarPolling() {
    pararPolling();
    chatPollTimer = setInterval(async () => {
        if (!chatContractId) { pararPolling(); return; }
        const msgs = await API.get(`/mensagens/${chatContractId}`).catch(() => null);
        if (!msgs) return;
        const ultimo = msgs.length > 0 ? msgs[msgs.length - 1].id : 0;
        if (ultimo > chatLastMsgId) {
            renderMensagens(msgs);
            chatLastMsgId = ultimo;
            marcarLidas();
        }
    }, 4000);
}

function pararPolling() {
    if (chatPollTimer) { clearInterval(chatPollTimer); chatPollTimer = null; }
}

// Deep-link: abre chat automaticamente se URL tiver ?abrir_chat=ID
window.addEventListener('load', () => {
    const params = new URLSearchParams(location.search);
    const cid = params.get('abrir_chat');
    if (cid) {
        setTimeout(async () => {
            const meus = await API.get('/contratos/meus').catch(() => []);
            const contrato = meus.find(c => String(c.id) === String(cid));
            if (contrato && contrato.status === 'em_andamento') {
                const parceiro = Sessao.tipo === 'empresa' ? contrato.freelancer_nome : contrato.nome_empresa;
                abrirChat(contrato.id, contrato.vaga_titulo, parceiro);
            }
        }, 600);
    }
});
