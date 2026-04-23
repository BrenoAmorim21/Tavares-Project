// ============================================================
//  WorkFinder — auth.js
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// ─── Utilitários ────────────────────────────────────────────

function mostrarErro(idElemento, mensagem) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  el.textContent = mensagem;
  el.classList.remove('hidden');
}

function ocultarErro(idElemento) {
  const el = document.getElementById(idElemento);
  if (el) el.classList.add('hidden');
}

function setLoading(btnId, carregando) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = carregando;
  btn.querySelector('.btn-text')?.classList.toggle('hidden', carregando);
  btn.querySelector('.btn-loading')?.classList.toggle('hidden', !carregando);
}

function salvarSessao(dados) {
  localStorage.setItem('wf_token', dados.token);
  localStorage.setItem('wf_tipo',  dados.tipo);
  localStorage.setItem('wf_nome',  dados.nome);
  localStorage.setItem('wf_id',    dados.id);
  if (dados.perfil_id) localStorage.setItem('wf_perfil_id', String(dados.perfil_id));
}

function redirecionarDashboard(tipo) {
  const emPages = window.location.pathname.includes('/pages/');
  const base = emPages ? '' : 'pages/';
  if (tipo === 'empresa') {
    window.location.href = base + 'dash_empresa.html';
  } else {
    window.location.href = base + 'home.html';
  }
}

function verificarSessao() {
  const token = localStorage.getItem('wf_token');
  const tipo  = localStorage.getItem('wf_tipo');
  if (token && tipo) redirecionarDashboard(tipo);
}

// ─── MODO DEMO ───────────────────────────────────────────────
// Usuários para testar sem o backend Flask rodando.
// freelancer@demo.com / 12345678  → vai para home.html
// empresa@demo.com    / 12345678  → vai para dash_empresa.html
const DEMO_USERS = {
  'freelancer@demo.com': { tipo: 'freelancer', nome: 'Mateus Vieira',   id: 1 },
  'empresa@demo.com':    { tipo: 'empresa',    nome: 'Lojafy Soluções', id: 2 },
};
const DEMO_SENHA = '12345678';

// ─── LOGIN ──────────────────────────────────────────────────

const formLogin = document.getElementById('login-form');
if (formLogin) {
  verificarSessao();

  document.getElementById('toggle-senha')?.addEventListener('click', () => {
    const input = document.getElementById('senha');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarErro('msg-error');
    setLoading('btn-login', true);

    const email = formLogin.email.value.trim().toLowerCase();
    const senha = formLogin.senha.value;

    // ── Checa modo demo primeiro ──
    if (DEMO_USERS[email]) {
      if (senha === DEMO_SENHA) {
        const u = DEMO_USERS[email];
        salvarSessao({ token: 'demo-token', ...u });
        setLoading('btn-login', false);
        redirecionarDashboard(u.tipo);
        return;
      } else {
        mostrarErro('msg-error', 'Senha incorreta. No modo demo use: 12345678');
        setLoading('btn-login', false);
        return;
      }
    }

    // ── Chama a API real ──
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await res.json();

      if (!res.ok) {
        mostrarErro('msg-error', dados.mensagem || 'E-mail ou senha incorretos.');
        return;
      }

      salvarSessao(dados);
      redirecionarDashboard(dados.tipo);

    } catch (err) {
      mostrarErro('msg-error', 'Servidor indisponível. Use modo demo: freelancer@demo.com / 12345678');
      console.error(err);
    } finally {
      setLoading('btn-login', false);
    }
  });
}

// ─── CADASTRO ───────────────────────────────────────────────

window.selecionarTipo = function(tipo) {
  document.getElementById('step-tipo').classList.remove('active');
  document.getElementById('step-tipo').classList.add('hidden');
  document.getElementById(`step-${tipo}`).classList.remove('hidden');
  document.getElementById(`step-${tipo}`).classList.add('active');
};

window.voltarTipo = function() {
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  document.getElementById('step-tipo').classList.remove('hidden');
  document.getElementById('step-tipo').classList.add('active');
};

const formEmpresa = document.getElementById('form-empresa');
if (formEmpresa) {
  formEmpresa.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarErro('msg-error-empresa');

    const senha     = formEmpresa.senha.value;
    const senhaConf = formEmpresa.senha_conf.value;

    if (senha !== senhaConf) {
      mostrarErro('msg-error-empresa', 'As senhas não coincidem.');
      return;
    }

    const payload = {
      tipo: 'empresa',
      nome_empresa: formEmpresa.nome_empresa.value.trim(),
      cnpj: formEmpresa.cnpj.value.trim(),
      setor: formEmpresa.setor.value,
      tamanho: formEmpresa.tamanho.value,
      email: formEmpresa.email.value.trim(),
      senha,
      descricao: formEmpresa.descricao.value.trim()
    };

    await enviarCadastro(payload, 'msg-error-empresa');
  });
}

const formFreelancer = document.getElementById('form-freelancer');
if (formFreelancer) {
  formFreelancer.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarErro('msg-error-freelancer');

    const senha     = formFreelancer.senha.value;
    const senhaConf = formFreelancer.senha_conf.value;

    if (senha !== senhaConf) {
      mostrarErro('msg-error-freelancer', 'As senhas não coincidem.');
      return;
    }

    const payload = {
      tipo: 'freelancer',
      nome: formFreelancer.nome.value.trim(),
      cpf: formFreelancer.cpf.value.trim(),
      area: formFreelancer.area.value,
      experiencia: formFreelancer.experiencia.value,
      email: formFreelancer.email.value.trim(),
      senha,
      habilidades: formFreelancer.habilidades.value.trim(),
      portfolio: formFreelancer.portfolio.value.trim()
    };

    await enviarCadastro(payload, 'msg-error-freelancer');
  });
}

async function enviarCadastro(payload, idErro) {
  try {
    const res = await fetch(`${API_BASE}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const dados = await res.json();

    if (!res.ok) {
      mostrarErro(idErro, dados.mensagem || 'Erro ao criar conta. Tente novamente.');
      return;
    }

    salvarSessao(dados);
    redirecionarDashboard(dados.tipo);

  } catch (err) {
    mostrarErro(idErro, 'Servidor indisponível. Configure o Flask para criar contas.');
    console.error(err);
  }
}

// ─── Máscaras de input ───────────────────────────────────────
document.getElementById('cnpj')?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  e.target.value = v;
});

document.getElementById('cpf')?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = v;
});