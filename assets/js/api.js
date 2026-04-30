// ============================================================
//  WorkFinder — assets/js/api.js
//  Cliente central da API. Importar em todas as páginas.
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// ── Helpers de sessão ─────────────────────────────────────
const Sessao = {
    get token() { return localStorage.getItem('wf_token'); },
    get tipo() { return localStorage.getItem('wf_tipo'); },
    get nome() { return localStorage.getItem('wf_nome'); },
    get id() { return localStorage.getItem('wf_id'); },
    get perfil_id() { return localStorage.getItem('wf_perfil_id'); },
    get logado() { return !!this.token && this.token !== 'demo-token'; },

    salvar(d) {
        localStorage.setItem('wf_token', d.token);
        localStorage.setItem('wf_tipo', d.tipo);
        localStorage.setItem('wf_nome', d.nome);
        localStorage.setItem('wf_id', String(d.id));
        if (d.perfil_id) localStorage.setItem('wf_perfil_id', String(d.perfil_id));
    },

    limpar() {
        ['wf_token', 'wf_tipo', 'wf_nome', 'wf_id', 'wf_perfil_id'].forEach(k => localStorage.removeItem(k));
    },

    exigir() {
        if (!this.logado) {
            const em = window.location.pathname.includes('/pages/');
            window.location.href = em ? '../index.html' : 'index.html';
        }
    },

    redirecionar() {
        const em = window.location.pathname.includes('/pages/');
        const base = em ? '' : 'pages/';
        window.location.href = base + (this.tipo === 'empresa' ? 'dash_empresa.html' : 'home.html');
    }
};

// ── Requisição autenticada ─────────────────────────────────
async function api(method, path, body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (Sessao.token) opts.headers['Authorization'] = `Bearer ${Sessao.token}`;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw { status: res.status, mensagem: data.mensagem || 'Erro desconhecido.' };
    return data;
}

// Atalhos
const API = {
    get: (p) => api('GET', p),
    post: (p, b) => api('POST', p, b),
    put: (p, b) => api('PUT', p, b),
    patch: (p, b) => api('PATCH', p, b),
    delete: (p) => api('DELETE', p),
};

// ── Formatadores ──────────────────────────────────────────
function fmtMoeda(v) {
    if (!v) return '–';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

function fmtData(s) {
    if (!s) return '–';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(s));
}

function fmtRelativo(s) {
    if (!s) return '';
    const diff = Date.now() - new Date(s).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'agora mesmo';
    if (min < 60) return `há ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `há ${d} dia${d > 1 ? 's' : ''}`;
    if (d < 30) return `há ${Math.floor(d/7)} semana${Math.floor(d/7) > 1 ? 's' : ''}`;
    return fmtData(s);
}

function iniciais(nome) {
    if (!nome) return 'WF';
    return nome.trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── Stars HTML helper ────────────────────────────────────
function starsHTML(nota, animated = false) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const cls = i <= nota ? 'star-filled' : 'star-empty';
        const delay = animated ? `style="animation-delay:${(i-1)*0.08}s"` : '';
        html += `<span class="star ${cls}" ${delay}>★</span>`;
    }
    return html;
}

// ── Toast ─────────────────────────────────────────────────
function toast(msg, tipo = 'success') {
    let c = document.getElementById('wf-toasts');
    if (!c) {
        c = document.createElement('div');
        c.id = 'wf-toasts';
        c.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem';
        document.body.appendChild(c);
    }
    const cores = {
        success: '#F0FDF4:#059669:#6EE7B7:✓',
        error: '#FEF2F2:#DC2626:#FECACA:✕',
        info: '#EBF2FF:#1A56DB:#BFDBFE:ℹ',
    };
    const [bg, cor, borda, icon] = (cores[tipo] || cores.success).split(':');
    const el = document.createElement('div');
    el.style.cssText = `background:${bg};color:${cor};border:1px solid ${borda};border-radius:10px;padding:.75rem 1.1rem;font-size:.875rem;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.1);display:flex;align-items:center;gap:.5rem;max-width:320px;animation:slideIn .25s ease`;
    el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    if (!document.getElementById('wf-toast-style')) {
        const s = document.createElement('style');
        s.id = 'wf-toast-style';
        s.textContent = `
            @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
            .star{font-size:1rem;transition:all .2s}
            .star-filled{color:#F59E0B;text-shadow:0 0 6px rgba(245,158,11,.4)}
            .star-empty{color:#D1D5DB}
            .stars-animated .star-filled{animation:starPop .4s ease both}
            @keyframes starPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
        `;
        document.head.appendChild(s);
    }
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ── Sair ─────────────────────────────────────────────────
function sair() {
    if (!confirm('Deseja sair da sua conta?')) return;
    Sessao.limpar();
    const em = window.location.pathname.includes('/pages/');
    window.location.href = em ? '../index.html' : 'index.html';
}

// ── Notificações ─────────────────────────────────────────
const Notif = {
    _panel: null,

    async carregarBadge() {
        if (!Sessao.logado) return;
        try {
            const { count } = await API.get('/notificacoes/nao-lidas');
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.textContent = count > 9 ? '9+' : count || '';
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch {}
    },

    async abrirPainel() {
        const btn = document.getElementById('notif-btn');
        let painel = document.getElementById('notif-painel');
        if (painel) { painel.remove(); return; }

        painel = document.createElement('div');
        painel.id = 'notif-painel';
        painel.style.cssText = `
            position:absolute;top:calc(100% + 8px);right:0;width:340px;max-height:420px;
            background:#fff;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.18);
            border:1px solid #E2E8F0;z-index:9999;overflow:hidden;
            animation:slideIn .2s ease;
        `;
        painel.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;border-bottom:1px solid #E2E8F0">
                <span style="font-weight:700;font-size:.95rem">Notificações</span>
                <button onclick="Notif.marcarTodas()" style="font-size:.78rem;color:#1A56DB;background:none;border:none;cursor:pointer;font-family:inherit">Marcar todas como lidas</button>
            </div>
            <div id="notif-lista" style="overflow-y:auto;max-height:340px">
                <div style="text-align:center;padding:2rem;color:#718096;font-size:.875rem">Carregando...</div>
            </div>
        `;
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(painel);

        try {
            const rows = await API.get('/notificacoes');
            const lista = document.getElementById('notif-lista');
            if (!rows.length) {
                lista.innerHTML = '<div style="text-align:center;padding:2rem;color:#718096;font-size:.875rem">Nenhuma notificação.</div>';
            } else {
                lista.innerHTML = rows.map(r => `
                <div onclick="Notif.clicar(${r.id},'${r.link || ''}')"
                     style="padding:.85rem 1.1rem;border-bottom:1px solid #F7F9FC;cursor:pointer;
                            background:${r.lida ? '#fff' : '#F0F5FF'};transition:background .15s"
                     onmouseover="this.style.background='#F7F9FC'" onmouseout="this.style.background='${r.lida ? '#fff' : '#F0F5FF'}'">
                    <div style="display:flex;align-items:start;gap:.6rem">
                        <span style="font-size:1.1rem;line-height:1.2">${Notif._icone(r.tipo)}</span>
                        <div style="flex:1;min-width:0">
                            <div style="font-weight:${r.lida ? '500' : '600'};font-size:.875rem;color:#0E1726;margin-bottom:.2rem">${r.titulo}</div>
                            <div style="font-size:.8rem;color:#4A5568;white-space:normal;line-height:1.4">${r.mensagem || ''}</div>
                            <div style="font-size:.72rem;color:#718096;margin-top:.25rem">${fmtRelativo(r.criado_em)}</div>
                        </div>
                        ${!r.lida ? '<span style="width:8px;height:8px;border-radius:50%;background:#1A56DB;flex-shrink:0;margin-top:4px"></span>' : ''}
                    </div>
                </div>`).join('');
            }
        } catch {
            document.getElementById('notif-lista').innerHTML =
                '<div style="text-align:center;padding:2rem;color:#DC2626;font-size:.875rem">Erro ao carregar.</div>';
        }

        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!painel.contains(e.target) && e.target !== btn) {
                    painel.remove();
                    document.removeEventListener('click', handler);
                }
            });
        }, 50);
    },

    _icone(tipo) {
        const map = {
            nova_proposta: '👥', proposta_aceita: '🎉', proposta_recusada: '❌',
            nova_avaliacao: '⭐', contrato_concluido: '✅', proposta_respondida: '📨',
        };
        return map[tipo] || '🔔';
    },

    async clicar(id, link) {
        try { await API.patch(`/notificacoes/${id}/lida`, {}); } catch {}
        document.getElementById('notif-painel')?.remove();
        await Notif.carregarBadge();
        if (link) window.location.href = link;
    },

    async marcarTodas() {
        try { await API.patch('/notificacoes/marcar-todas', {}); } catch {}
        document.getElementById('notif-painel')?.remove();
        await Notif.carregarBadge();
    },

    injetar(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container || document.getElementById('notif-btn')) return;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:inline-flex;align-items:center';
        wrap.innerHTML = `
            <button id="notif-btn" onclick="Notif.abrirPainel()" title="Notificações"
                style="position:relative;background:none;border:none;cursor:pointer;padding:.4rem;
                       border-radius:8px;color:#4A5568;display:flex;align-items:center;justify-content:center;
                       transition:background .15s"
                onmouseover="this.style.background='#F7F9FC'" onmouseout="this.style.background='none'">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>
                </svg>
                <span id="notif-badge" style="display:none;position:absolute;top:-2px;right:-2px;
                    background:#DC2626;color:#fff;font-size:.6rem;font-weight:700;
                    min-width:16px;height:16px;border-radius:8px;padding:0 3px;
                    align-items:center;justify-content:center;line-height:1"></span>
            </button>
        `;
        container.insertBefore(wrap, container.firstChild);
        Notif.carregarBadge();
        setInterval(() => Notif.carregarBadge(), 60000);
    }
};
