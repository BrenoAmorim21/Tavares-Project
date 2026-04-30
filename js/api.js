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
    return fmtData(s);
}

function iniciais(nome) {
    if (!nome) return 'WF';
    return nome.trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
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
        s.textContent = '@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
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