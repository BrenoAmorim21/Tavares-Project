<div align="center">

# 🔍 WorkFinder

### Plataforma de Crowdsourcing para Conexão entre Empresas e Freelancers

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

<br/>

> Desenvolvido como projeto acadêmico no **Centro Universitário SENAC** — São Paulo, 2026.

</div>

---

## 📌 Sobre o Projeto

O **WorkFinder** é uma plataforma web de crowdsourcing que conecta **empresas** que buscam profissionais especializados a **freelancers** qualificados de diversas áreas de tecnologia.

A plataforma conta com dois perfis distintos de usuário, cada um com funcionalidades específicas que cobrem todo o ciclo de uma contratação: da publicação do projeto ao fechamento do contrato.

---

## ✨ Funcionalidades

### 🏢 Para Empresas Solicitantes
- Dashboard centralizado com métricas de projetos, propostas recebidas e contratações
- Publicação de vagas com título, tipo de contratação, modalidade, orçamento e prazo
- Visualização e gerenciamento de propostas recebidas por projeto
- Aceite ou recusa de propostas com atualização em tempo real
- Histórico de contratos e freelancers contratados
- Sistema de notificações sobre novas candidaturas e atualizações de status

### 💼 Para Freelancers
- Perfil profissional completo com habilidades, área de atuação e portfólio
- Listagem dinâmica de projetos disponíveis com filtros por área, modalidade e orçamento
- Visualização detalhada de vagas com informações da empresa solicitante
- Envio de propostas com valor, prazo estimado e mensagem personalizada
- Acompanhamento de propostas em tempo real (pendente, aceita, recusada)
- Tela de contratos ativos e histórico de trabalhos realizados
- Sistema de notificações sobre atualizações de propostas e contratos

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|--------|-----------|-----------|
| Front-end | HTML5 & CSS3 | Estrutura e estilização das interfaces |
| Front-end | JavaScript (ES6+) | Interatividade, DOM dinâmico e comunicação com API |
| Back-end | Python 3 | Lógica de negócio e processamento server-side |
| Back-end | Flask 3.0.3 | Framework web e roteamento da API REST |
| Back-end | Flask-CORS 4.0.1 | Gerenciamento de Cross-Origin Resource Sharing |
| Banco de Dados | MySQL | Persistência relacional dos dados da plataforma |
| DB Driver | mysql-connector-python 8.4.0 | Conexão direta com o banco de dados MySQL |
| Autenticação | PyJWT 2.8.0 | Geração e validação de tokens JWT |
| Segurança | bcrypt 4.1.3 | Hash seguro de senhas |
| Configuração | python-dotenv 1.0.1 | Gerenciamento de variáveis de ambiente |
| Infra / Nuvem | Microsoft Azure | Provisionamento do banco de dados em nuvem |
| Versionamento | Git & GitHub | Controle de versão e colaboração em equipe |
| Design | Figma | Prototipagem e design das interfaces |

---

## 🏗️ Arquitetura do Projeto

```
WorkFinder/
├── assets/
│   └── css/                        # Folhas de estilo por tela
│       ├── dash_empresa.css
│       ├── detal_vaga.css
│       ├── home.css
│       ├── perfil_empresa.css
│       ├── perfil-freelancer.css
│       └── pub_vaga.css
│
├── BD/
│   └── Schema.SQL                  # Definição completa do banco de dados
│
├── js/                             # Módulos JavaScript por funcionalidade
│   ├── api.js
│   ├── auth.js
│   ├── contratos.js
│   ├── dash_empresa.js
│   ├── detal_vaga.js
│   ├── home.js
│   ├── perfil_empresa.js
│   ├── perfil-freelancer.js
│   ├── propostas.js
│   └── pub_vaga.js
│
├── pages/                          # Páginas HTML da plataforma
│   ├── cadastro.html
│   ├── contratos.html
│   ├── dash_empresa.html
│   ├── detal_vaga.html
│   ├── home.html
│   ├── perfil_empresa.html
│   ├── perfil-freelancer.html
│   ├── propostas.html
│   └── pub_vaga.html
│
├── py/                             # Back-end Python/Flask
│   ├── routes/                     # Módulos de rotas da API
│   │   ├── auth.py
│   │   ├── contracts.py
│   │   ├── jobs.py
│   │   ├── proposals.py
│   │   ├── reviews.py
│   │   ├── stats.py
│   │   └── users.py
│   ├── app.py                      # Ponto de entrada da aplicação Flask
│   ├── config.py                   # Configurações da aplicação
│   ├── db.py                       # Conexão com o banco de dados
│   ├── decorators.py               # Middlewares de autenticação JWT
│   └── seed_data.py                # Script de população inicial do banco
│
├── index.html
├── README.md
└── requirements.txt
```

---

## 🔌 API REST — Endpoints

### 🔐 Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro de novo usuário (Empresa ou Freelancer) |
| `POST` | `/auth/login` | Autenticação e geração de token JWT |
| `POST` | `/auth/logout` | Invalidação de sessão |

### 👤 Usuários e Perfis
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/users/me` | Retorna dados do usuário autenticado |
| `PUT` | `/users/me` | Atualiza perfil do usuário |
| `GET` | `/users/:id` | Consulta perfil público de um usuário |

### 📋 Projetos / Vagas
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/jobs` | Lista todos os projetos disponíveis (com filtros) |
| `GET` | `/jobs/:id` | Detalhes de um projeto específico |
| `POST` | `/jobs` | Publica novo projeto (perfil Empresa) |
| `PUT` | `/jobs/:id` | Atualiza dados de um projeto |
| `DELETE` | `/jobs/:id` | Encerra ou remove um projeto |

### 📨 Propostas
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/proposals` | Lista propostas do usuário autenticado |
| `POST` | `/proposals` | Envia nova proposta para um projeto |
| `PUT` | `/proposals/:id` | Aceita ou recusa uma proposta |
| `GET` | `/proposals/job/:id` | Lista propostas recebidas por projeto |

### 📄 Contratos
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/contracts` | Lista contratos ativos e histórico |
| `GET` | `/contracts/:id` | Detalhes de um contrato específico |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.10+
- MySQL 8.0+
- Git
- Navegador moderno (Chrome, Firefox, Edge)

### 1. Clonar o Repositório

```bash
git clone https://github.com/BrenoAmorim21/WorkFinder.git
cd WorkFinder
```

### 2. Configurar o Banco de Dados

```bash
# Crie o banco no MySQL
mysql -u root -p -e "CREATE DATABASE workfinder;"

# Execute o schema para criar as tabelas
mysql -u root -p workfinder < BD/Schema.SQL
```

### 3. Configurar o Back-end

```bash
cd py

# Criar e ativar o ambiente virtual
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# Instalar dependências
pip install -r requirements.txt
```

Crie um arquivo `.env` dentro da pasta `py/` com as seguintes variáveis:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=workfinder
JWT_SECRET_KEY=sua_chave_secreta
```

### 4. Popular o Banco com Dados de Teste (opcional)

```bash
python seed_data.py
```

### 5. Iniciar o Servidor Flask

```bash
python app.py
```

O servidor estará disponível em `http://localhost:5000`.

### 6. Abrir o Front-end

Abra o arquivo `index.html` no navegador ou use a extensão **Live Server** do VS Code.

---

## 🗄️ Banco de Dados

O banco MySQL foi modelado para suportar todos os fluxos da plataforma:

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Dados de autenticação e tipo de perfil |
| `perfis_empresa` | Informações corporativas das empresas |
| `perfis_freelancer` | Habilidades e dados profissionais dos freelancers |
| `projetos` | Vagas publicadas pelas empresas |
| `propostas` | Candidaturas enviadas por freelancers |
| `contratos` | Registros de contratações realizadas |
| `avaliacoes` | Avaliações mútuas ao final de contratos |
| `notificacoes` | Eventos relevantes gerados para os usuários |

---

## 📦 Dependências

```txt
flask==3.0.3
flask-cors==4.0.1
mysql-connector-python==8.4.0
bcrypt==4.1.3
PyJWT==2.8.0
python-dotenv==1.0.1
```

---

## 👥 Equipe

<div align="center">

| Nome | GitHub |
|------|--------|
| **Breno Amorim Candido** | [@BrenoAmorim21](https://github.com/BrenoAmorim21) |
| **Bruno Augusto dos Santos Pereira** | [userbrun1n](https://github.com/userbrun1n) |
| **Fernando Ferreira Mendes** | — |

</div>

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos no **Centro Universitário SENAC** — São Paulo, 2026.  
Todos os direitos reservados aos autores.

---

<div align="center">

Feito com ❤️ pela equipe WorkFinder · SENAC São Paulo · 2026

</div>
