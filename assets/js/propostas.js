// ============================================================
//  WorkFinder — assets/js/propostas.js
//  Propostas do freelancer — integrado com API real
// ============================================================

let todasPropostas = [];
let filtroAtivo = 'todas';
let propostaSel = null;

async function carregarPropostas() {
    try {
        todasPropostas = await API.get('/propostas/minhas');
        atualizarContadores();
        renderPropostas();
    } catch (e) {
        document.getElementById('prop-list').innerHTML =
            '<p style="color:#DC2626;padding:1rem;text-align:center">Erro ao carregar propostas. O servidor está rodando?</p>';
    }
}

function atualizarContadores() {
    const c = { pendente: 0, aceita: 0, recusada: 0, cancelada: 0 };
    todasPropostas.forEach(p => { if (c[p.status] !== undefined) c[p.status]++; });
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('count-pendente', c.pendente);
    set('count-aceita', c.aceita);
    set('count-recusada', c.recusada);
    set('count-total', todasPropostas.length);
    set('tc-todas', todasPropostas.length);
    set('tc-pendente', c.pendente);
    set('tc-aceita', c.aceita);
    set('tc-recusada', c.recusada);
}

function timelineHTML(status) {
    const prog = { pendente: 1, aceita: 2, recusada: 2, cancelada: 0 }[status] ?? 1;
    const labels = {
        pendente: 'Aguardando resposta da empresa',
        aceita: '🎉 Proposta aceita! Contrato gerado.',
        recusada: 'Não selecionado desta vez',
        cancelada: 'Proposta cancelada',
    };
    return `
    <div class="timeline">
      <div class="tl-dot ${0 < prog ? 'done' : 'current'}">✓</div>
      <div class="tl-line ${1 <= prog ? 'done' : 'pending'}"></div>
      <div class="tl-dot ${1 < prog ? 'done' : 1 === prog ? 'current' : 'pending'}">${1 < prog ? '✓' : 2}</div>
      <div class="tl-line ${2 <= prog ? 'done' : 'pending'}"></div>
      <div class="tl-dot ${2 <= prog ? 'done' : 'pending'}">${2 <= prog ? '✓' : 3}</div>
      <span class="tl-label">${labels[status] || ''}</span>
    </div>`;
}

function renderPropostas() {
    const lista = filtroAtivo === 'todas'
        ? todasPropostas
        : todasPropostas.filter(p => p.status === filtroAtivo);

    const el = document.getElementById('prop-list');

    if (lista.length === 0) {
        el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>${filtroAtivo === 'todas' ? 'Você ainda não enviou nenhuma proposta.' : 'Nenhuma proposta com este status.'}</p>
        ${filtroAtivo === 'todas' ? '<button class="btn-explore" onclick="location.href=\'home.html\'">Explorar projetos →</button>' : ''}
      </div>`;
        return;
    }

    el.innerHTML = lista.map(p => {
        const badgeCls = { pendente: 'badge-pendente', aceita: 'badge-aceita', recusada: 'badge-recusada', cancelada: 'badge-cancelada' }[p.status] || '';
        const badgeTxt = { pendente: '⏳ Pendente', aceita: '✓ Aceita', recusada: '✕ Recusada', cancelada: 'Cancelada' }[p.status] || p.status;
        return `
      <div class="prop-card ${p.status}" onclick="abrirDetalhe(${p.id})">
        ${timelineHTML(p.status)}
        <div class="prop-head">
          <div>
            <div class="prop-title">${p.vaga_titulo}</div>
            <div class="prop-empresa">${p.nome_empresa}</div>
          </div>
          <span class="badge ${badgeCls}">${badgeTxt}</span>
        </div>
        <div class="prop-msg">${p.mensagem}</div>
        <div class="prop-footer">
          <div class="prop-meta">
            <span class="prop-valor">${p.valor_proposto ? fmtMoeda(p.valor_proposto) : 'A combinar'}</span>
            <span class="prop-info">⏱ ${p.prazo_proposto || '–'}</span>
            <span class="prop-info">${fmtRelativo(p.criado_em)}</span>
          </div>
          <div style="display:flex;gap:.5rem" onclick="event.stopPropagation()">
            <button class="btn-sm" onclick="location.href='detal_vaga.html?id=${p.job_id}'">Ver vaga</button>
            ${p.status === 'pendente'
                ? `<button class="btn-sm btn-sm-danger" onclick="event.stopPropagation();confirmarCancelar(${p.id})">Cancelar</button>`
                : ''}
          </div>
        </div>
      </div>`;
    }).join('');
}

function abrirDetalhe(id) {
    propostaSel = todasPropostas.find(p => p.id === id);
    if (!propostaSel) return;
    document.getElementById('detail-titulo').textContent = propostaSel.vaga_titulo;
    document.getElementById('detail-msg').textContent = `"${propostaSel.mensagem}"`;
    document.getElementById('detail-rows').innerHTML = [
        ['Empresa', propostaSel.nome_empresa],
        ['Status', propostaSel.status],
        ['Valor', propostaSel.valor_proposto ? fmtMoeda(propostaSel.valor_proposto) : 'A combinar'],
        ['Prazo', propostaSel.prazo_proposto || '–'],
        ['Enviado em', fmtRelativo(propostaSel.criado_em)],
    ].map(([k, v]) => `
    <div class="detail-row">
      <span class="detail-key">${k}</span>
      <span>${v}</span>
    </div>`).join('');
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) btnCancelar.style.display = propostaSel.status === 'pendente' ? '' : 'none';
    document.getElementById('modal-detail').classList.add('open');
}

async function confirmarCancelar(id) {
    if (!confirm('Deseja cancelar esta proposta?')) return;
    try {
        await API.delete(`/propostas/${id}`);
        toast('Proposta cancelada.', 'info');
        fecharModal('modal-detail');
        carregarPropostas();
    } catch (e) { toast(e.mensagem || 'Erro ao cancelar.', 'error'); }
}

function cancelarProposta() {
    if (propostaSel) confirmarCancelar(propostaSel.id);
}

function setTab(el, filtro) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filtroAtivo = filtro;
    renderPropostas();
}

function fecharModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
    Sessao.exigir();
    if (Sessao.tipo !== 'freelancer') { alert('Esta página é para freelancers.'); history.back(); return; }
    Notif.injetar('.nav-actions');
    carregarPropostas();
    setInterval(carregarPropostas, 30000);
});
