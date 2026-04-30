-- ============================================================
--  WorkFinder — schema.sql
--  Execute este arquivo no MySQL Workbench para criar o banco
-- ============================================================

CREATE DATABASE IF NOT EXISTS workfinder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE workfinder;

-- ─── USUÁRIOS BASE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('empresa', 'freelancer') NOT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ─── PERFIL EMPRESA ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    setor VARCHAR(100),
    tamanho VARCHAR(50),
    descricao TEXT,
    logo_url VARCHAR(500),
    site_url VARCHAR(500),
    cidade VARCHAR(100),
    estado CHAR(2),
    verificada TINYINT(1) NOT NULL DEFAULT 0,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ─── PERFIL FREELANCER ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS freelancers (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    area VARCHAR(100),
    experiencia VARCHAR(50),
    habilidades TEXT,
    portfolio_url VARCHAR(500),
    bio TEXT,
    foto_url VARCHAR(500),
    cidade VARCHAR(100),
    estado CHAR(2),
    pretensao_hora DECIMAL(10, 2),
    disponivel TINYINT(1) NOT NULL DEFAULT 1,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ─── VAGAS / PROJETOS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id INT NOT NULL AUTO_INCREMENT,
    company_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo ENUM(
        'projeto',
        'freelance',
        'part-time'
    ) NOT NULL DEFAULT 'projeto',
    modalidade ENUM(
        'remoto',
        'presencial',
        'hibrido'
    ) NOT NULL DEFAULT 'remoto',
    area VARCHAR(100),
    habilidades TEXT,
    nivel VARCHAR(50),
    orcamento_min DECIMAL(10, 2),
    orcamento_max DECIMAL(10, 2),
    prazo_dias INT,
    deadline DATE,
    status ENUM(
        'aberta',
        'fechada',
        'pausada',
        'concluida',
        'cancelada'
    ) NOT NULL DEFAULT 'aberta',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
);

-- ─── PROPOSTAS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
    id INT NOT NULL AUTO_INCREMENT,
    job_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    mensagem TEXT NOT NULL,
    valor_proposto DECIMAL(10, 2),
    prazo_proposto DATE,
    status ENUM(
        'pendente',
        'aceita',
        'recusada',
        'cancelada'
    ) NOT NULL DEFAULT 'pendente',
    respondido_em DATETIME,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_proposta (job_id, freelancer_id),
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES freelancers (id) ON DELETE CASCADE
);

-- ─── CONTRATOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
    id INT NOT NULL AUTO_INCREMENT,
    job_id INT NOT NULL,
    proposal_id INT NOT NULL,
    company_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    valor_final DECIMAL(10, 2),
    prazo_final DATE,
    status ENUM(
        'em_andamento',
        'concluido',
        'cancelado'
    ) NOT NULL DEFAULT 'em_andamento',
    iniciado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    concluido_em DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals (id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES freelancers (id) ON DELETE CASCADE
);

-- ─── AVALIAÇÕES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id INT NOT NULL AUTO_INCREMENT,
    contract_id INT NOT NULL,
    avaliador_tipo ENUM('empresa', 'freelancer') NOT NULL,
    avaliado_user_id INT NOT NULL,
    nota TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_review (contract_id, avaliador_tipo),
    FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE
);

-- ─── ÍNDICES ÚTEIS ──────────────────────────────────────────
CREATE INDEX idx_jobs_status ON jobs (status);

CREATE INDEX idx_jobs_area ON jobs (area);

CREATE INDEX idx_jobs_company ON jobs (company_id);

CREATE INDEX idx_prop_job ON proposals (job_id);

CREATE INDEX idx_prop_free ON proposals (freelancer_id);

CREATE INDEX idx_ct_company ON contracts (company_id);

CREATE INDEX idx_ct_free ON contracts (freelancer_id);

CREATE INDEX idx_rev_contract ON reviews (contract_id);

-- ─── NOTIFICAÇÕES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    lida TINYINT(1) NOT NULL DEFAULT 0,
    link VARCHAR(500),
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_user ON notifications (user_id, lida);