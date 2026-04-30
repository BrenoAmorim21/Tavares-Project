-- ============================================================
-- WorkFinder - seed_data.sql
-- Dados reais para demonstracao / apresentacao
-- Senha padrao para todos: "12345678" (hash bcrypt)
-- ============================================================

USE workfinder;

DELETE FROM reviews;

DELETE FROM contracts;

DELETE FROM proposals;

DELETE FROM jobs;

DELETE FROM freelancers;

DELETE FROM companies;

DELETE FROM users;

INSERT INTO
    users (id, email, senha_hash, tipo)
VALUES (
        1,
        'contato@totvs.com.br',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        2,
        'rh@rdstation.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        3,
        'talentos@nubank.com.br',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        4,
        'projetos@ifood.com.br',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        5,
        'dev@vtex.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        6,
        'rh@stone.com.br',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'empresa'
    ),
    (
        10,
        'mateus.vieira@gmail.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    ),
    (
        11,
        'ana.costa.dev@gmail.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    ),
    (
        12,
        'rafael.souza@outlook.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    ),
    (
        13,
        'carol.mendes@gmail.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    ),
    (
        14,
        'lucas.ferreira@gmail.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    ),
    (
        15,
        'bia.alves@gmail.com',
        '$2b$12$LJ3a4PEO0QF9X2VhKg6KYeVzMfHpMqk7YPj8FY1xRfW5KQhXhKqHW',
        'freelancer'
    );

INSERT INTO
    companies (
        id,
        user_id,
        nome_empresa,
        cnpj,
        setor,
        tamanho,
        descricao,
        site_url,
        cidade,
        estado,
        verificada
    )
VALUES (
        1,
        1,
        'TOTVS S.A.',
        '53.113.791/0001-22',
        'Tecnologia',
        '200+ funcionarios',
        'A TOTVS e a maior empresa de tecnologia do Brasil, lider em sistemas de gestao empresarial (ERP). Com mais de 40 anos no mercado, atendemos mais de 70 mil clientes em 12 paises. Buscamos freelancers especializados para projetos de inovacao e transformacao digital.',
        'https://www.totvs.com',
        'Sao Paulo',
        'SP',
        1
    ),
    (
        2,
        2,
        'RD Station',
        '13.021.784/0001-69',
        'Marketing Digital',
        '51-200 funcionarios',
        'A RD Station e a principal plataforma de automacao de marketing e vendas da America Latina. Ajudamos mais de 40 mil empresas a crescerem com marketing digital. Precisamos de freelancers para projetos de integracao e desenvolvimento de plugins.',
        'https://www.rdstation.com',
        'Florianopolis',
        'SC',
        1
    ),
    (
        3,
        3,
        'Nubank',
        '18.236.120/0001-58',
        'Fintech',
        '200+ funcionarios',
        'O Nubank e o maior banco digital independente do mundo, com mais de 90 milhoes de clientes no Brasil, Mexico e Colombia. Buscamos profissionais para projetos especiais de data science, engenharia de dados e design de produto.',
        'https://www.nubank.com.br',
        'Sao Paulo',
        'SP',
        1
    ),
    (
        4,
        4,
        'iFood',
        '14.380.200/0001-21',
        'Alimentacao / Tecnologia',
        '200+ funcionarios',
        'O iFood e a maior plataforma de delivery de comida da America Latina, conectando milhoes de consumidores a restaurantes parceiros. Contratamos freelancers para projetos de UX Research, desenvolvimento mobile e analise de dados.',
        'https://www.ifood.com.br',
        'Osasco',
        'SP',
        1
    ),
    (
        5,
        5,
        'VTEX',
        '05.314.272/0001-20',
        'E-commerce / Tecnologia',
        '51-200 funcionarios',
        'A VTEX e uma plataforma global de comercio digital que atende grandes marcas como Carrefour, Sony e Walmart. Buscamos freelancers para criar integracoes, apps e customizacoes para nossos clientes enterprise.',
        'https://vtex.com',
        'Rio de Janeiro',
        'RJ',
        1
    ),
    (
        6,
        6,
        'Stone Pagamentos',
        '16.501.555/0001-57',
        'Fintech / Pagamentos',
        '200+ funcionarios',
        'A Stone e uma das maiores empresas de tecnologia financeira do Brasil, focada em solucoes de pagamento para empreendedores. Precisamos de freelancers para projetos de IoT, dashboards e integracoes bancarias.',
        'https://www.stone.com.br',
        'Rio de Janeiro',
        'RJ',
        1
    );

INSERT INTO
    freelancers (
        id,
        user_id,
        nome,
        cpf,
        area,
        experiencia,
        habilidades,
        portfolio_url,
        bio,
        cidade,
        estado,
        pretensao_hora,
        disponivel
    )
VALUES (
        1,
        10,
        'Mateus Vieira',
        '123.456.789-00',
        'Desenvolvimento Web',
        'Pleno (2-5 anos)',
        'Python, Flask, React, Node.js, MySQL, Docker, Git, REST APIs, TypeScript, Linux',
        'https://github.com/mvieira',
        'Desenvolvedor full-stack com 4 anos de experiencia, especializado em Python (Flask/Django) e React. Apaixonado por construir produtos que realmente resolvem problemas. Ja trabalhei em projetos de e-commerce, SaaS, IoT e analise de dados.',
        'Sao Paulo',
        'SP',
        120.00,
        1
    ),
    (
        2,
        11,
        'Ana Costa',
        '234.567.890-11',
        'Desenvolvimento Web',
        'Senior (5+ anos)',
        'Python, Django, Flask, PostgreSQL, Redis, Docker, AWS, CI/CD, GraphQL',
        'https://github.com/anacosta',
        'Engenheira de software senior com 7 anos de experiencia em desenvolvimento backend. Especialista em arquitetura de microsservicos e sistemas de alta performance. Ex-Globo.com e ex-PagSeguro.',
        'Rio de Janeiro',
        'RJ',
        180.00,
        1
    ),
    (
        3,
        12,
        'Rafael Souza',
        '345.678.901-22',
        'Desenvolvimento Web',
        'Senior (5+ anos)',
        'React, Next.js, TypeScript, Node.js, MongoDB, GraphQL, AWS, Figma',
        'https://rafaelsouza.dev',
        'Desenvolvedor frontend senior e tech lead com 6 anos de experiencia. Especializado em aplicacoes React de alta escala. Ja atuei em projetos para Ambev, Magazine Luiza e Mercado Livre.',
        'Belo Horizonte',
        'MG',
        150.00,
        1
    ),
    (
        4,
        13,
        'Carolina Mendes',
        '456.789.012-33',
        'Design Grafico / UI/UX',
        'Pleno (2-5 anos)',
        'Figma, Adobe XD, Illustrator, Photoshop, Design System, Prototipagem, UX Research',
        'https://behance.net/carolmendes',
        'Designer UI/UX com 4 anos de experiencia criando interfaces digitais para startups e empresas de tecnologia. Foco em design centrado no usuario e sistemas de design escalaveis.',
        'Curitiba',
        'PR',
        100.00,
        1
    ),
    (
        5,
        14,
        'Lucas Ferreira',
        '567.890.123-44',
        'Dados / BI',
        'Pleno (2-5 anos)',
        'Python, Pandas, Scikit-learn, SQL, Power BI, Tableau, Apache Spark, Machine Learning',
        'https://github.com/lucasferreira',
        'Cientista de dados com 3 anos de experiencia em modelagem preditiva, analise exploratoria e visualizacao. Projetos com foco em varejo, fintech e saude.',
        'Porto Alegre',
        'RS',
        130.00,
        1
    ),
    (
        6,
        15,
        'Beatriz Alves',
        '678.901.234-55',
        'Desenvolvimento Mobile',
        'Pleno (2-5 anos)',
        'React Native, Flutter, Firebase, Swift, Kotlin, REST APIs, Git',
        'https://github.com/biaalves',
        'Desenvolvedora mobile com 4 anos de experiencia em React Native e Flutter. Ja publiquei 12 apps na Play Store e App Store para clientes como 99, Drogasil e Smart Fit.',
        'Recife',
        'PE',
        110.00,
        1
    );

INSERT INTO
    jobs (
        id,
        company_id,
        titulo,
        descricao,
        tipo,
        modalidade,
        area,
        habilidades,
        nivel,
        orcamento_min,
        orcamento_max,
        prazo_dias,
        status,
        criado_em
    )
VALUES (
        1,
        1,
        'Desenvolvimento de modulo de relatorios para ERP TOTVS Protheus',
        'Precisamos de um desenvolvedor para criar um modulo de relatorios customizados no ERP Protheus, incluindo dashboards interativos com graficos, exportacao para PDF/Excel e filtros avancados. O modulo deve ser integrado ao sistema existente seguindo os padroes TOTVS de desenvolvimento.',
        'projeto',
        'remoto',
        'Desenvolvimento Web',
        'ADVPL, SQL Server, JavaScript, HTML, CSS, REST APIs',
        'Pleno / Senior',
        15000.00,
        25000.00,
        60,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        2,
        2,
        'Criacao de plugin de integracao RD Station com Shopify',
        'Desenvolver um app/plugin que integre a plataforma RD Station Marketing com lojas Shopify, sincronizando leads, eventos de compra e automacoes de email marketing. Deve incluir painel de configuracao no admin da Shopify e webhooks bidirecionais.',
        'projeto',
        'remoto',
        'Desenvolvimento Web',
        'Node.js, React, Shopify API, REST APIs, OAuth2, MongoDB',
        'Pleno / Senior',
        12000.00,
        18000.00,
        45,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    ),
    (
        3,
        3,
        'Analise preditiva de churn para base de clientes Nubank',
        'Projeto de data science para modelar e implementar um pipeline de machine learning que preveja cancelamentos de cartao de credito. Inclui ETL de dados anonimizados, feature engineering, treinamento de modelos (XGBoost, Random Forest), avaliacao e deploy via API Flask.',
        'freelance',
        'remoto',
        'Dados / BI',
        'Python, Pandas, Scikit-learn, XGBoost, SQL, Flask, Docker',
        'Senior (5+ anos)',
        20000.00,
        35000.00,
        90,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        4,
        4,
        'Redesign do fluxo de pedidos no app iFood para parceiros',
        'Redesign completo da experiencia de gestao de pedidos no app para restaurantes parceiros do iFood. O projeto inclui pesquisa com usuarios, wireframes, prototipos de alta fidelidade em Figma, testes de usabilidade e handoff para o time de engenharia.',
        'projeto',
        'hibrido',
        'Design Grafico / UI/UX',
        'Figma, UX Research, Design System, Prototipagem, Testes de Usabilidade',
        'Pleno / Senior',
        8000.00,
        14000.00,
        30,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        5,
        5,
        'Desenvolvimento de app VTEX IO para checkout customizado',
        'Criar uma app na plataforma VTEX IO que implemente um checkout customizado com calculo de frete em tempo real, multiplos metodos de pagamento (Pix, boleto, cartao) e integracao com ERP do cliente via API REST.',
        'projeto',
        'remoto',
        'Desenvolvimento Web',
        'React, TypeScript, Node.js, GraphQL, VTEX IO, Checkout API',
        'Senior (5+ anos)',
        18000.00,
        30000.00,
        60,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    ),
    (
        6,
        6,
        'Dashboard de monitoramento IoT para terminais de pagamento Stone',
        'Desenvolvimento de dashboard em React para monitoramento em tempo real de terminais de pagamento. Deve receber dados via WebSocket/MQTT, exibir status, alertas de manutencao e graficos de performance. Backend em Python/Flask.',
        'projeto',
        'remoto',
        'Desenvolvimento Web',
        'React, Python, Flask, WebSocket, MQTT, Docker, PostgreSQL',
        'Pleno / Senior',
        10000.00,
        16000.00,
        45,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 7 DAY)
    ),
    (
        7,
        1,
        'App mobile para forca de vendas TOTVS',
        'Desenvolvimento de aplicativo mobile (React Native) para equipe de vendas em campo, com catalogo de produtos offline-first, emissao de pedidos, consulta de estoque e sincronizacao com ERP Protheus.',
        'projeto',
        'remoto',
        'Desenvolvimento Mobile',
        'React Native, TypeScript, SQLite, REST APIs, Offline-first',
        'Pleno / Senior',
        22000.00,
        35000.00,
        90,
        'aberta',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        8,
        3,
        'Desenvolvimento de landing page para campanha Nubank Ultravioleta',
        'Criar landing page de alta performance para campanha do cartao Nubank Ultravioleta. Design moderno, animacoes suaves, formulario de interesse e integracao com API de leads.',
        'freelance',
        'remoto',
        'Desenvolvimento Web',
        'HTML, CSS, JavaScript, GSAP, Performance Web',
        'Pleno (2-5 anos)',
        3000.00,
        6000.00,
        15,
        'fechada',
        DATE_SUB(NOW(), INTERVAL 30 DAY)
    ),
    (
        9,
        4,
        'Automacao de relatorios de marketing iFood',
        'Criar pipeline automatizado de coleta e visualizacao de metricas de campanhas de marketing digital. Inclui integracao com Google Ads, Meta Ads e GA4, processamento com Python e visualizacao em dashboard interativo.',
        'freelance',
        'remoto',
        'Dados / BI',
        'Python, Google Ads API, Meta API, Pandas, Plotly, SQL',
        'Pleno (2-5 anos)',
        7000.00,
        12000.00,
        30,
        'concluida',
        DATE_SUB(NOW(), INTERVAL 60 DAY)
    ),
    (
        10,
        2,
        'Design System para produtos RD Station',
        'Criacao e documentacao de um design system completo para a familia de produtos RD Station, incluindo componentes em Figma, tokens de design, guidelines de acessibilidade e biblioteca de icones.',
        'projeto',
        'remoto',
        'Design Grafico / UI/UX',
        'Figma, Design System, Tokens, Acessibilidade, Documentacao',
        'Senior (5+ anos)',
        15000.00,
        22000.00,
        60,
        'concluida',
        DATE_SUB(NOW(), INTERVAL 90 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        1,
        1,
        1,
        'Ola! Tenho 4 anos de experiencia com desenvolvimento web e ja trabalhei com sistemas ERP. Posso entregar o modulo de relatorios com dashboards interativos usando Chart.js e exportacao PDF/Excel. Meu prazo estimado e de 50 dias.',
        19500.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 50 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        2,
        1,
        2,
        'Sou engenheira senior com experiencia em sistemas corporativos de grande porte. Ja desenvolvi modulos para SAP e Oracle. Garanto codigo limpo, testes automatizados e documentacao completa.',
        23000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 55 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        3,
        1,
        3,
        'Tenho experiencia solida com JavaScript e SQL Server, consigo criar dashboards responsivos e performaticos. Entrego com testes e deploy automatizado.',
        21000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 45 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 12 HOUR)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        4,
        2,
        1,
        'Ja desenvolvi integracoes com APIs de e-commerce e tenho experiencia com Node.js e React. Consigo criar a integracao bidirecional RD Station-Shopify com painel admin completo.',
        14000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 40 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        5,
        2,
        3,
        'Sou especialista em React e ja trabalhei com Shopify API. Posso entregar o plugin com OAuth2, webhooks e painel de configuracao em 35 dias.',
        16000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 35 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        6,
        3,
        5,
        'Cientista de dados com experiencia em modelos preditivos de churn para fintechs. Ja implementei pipeline completo com XGBoost e deploy via Flask. Posso apresentar resultados intermediarios a cada 2 semanas.',
        28000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 80 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ),
    (
        7,
        3,
        2,
        'Tenho experiencia com ML em producao e ja trabalhei com dados financeiros no PagSeguro. Consigo entregar o pipeline completo com monitoramento de performance do modelo.',
        32000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 85 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 6 HOUR)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        8,
        4,
        4,
        'Designer UI/UX com 4 anos de experiencia em apps de delivery e marketplace. Ja redesenhei fluxos similares para Rappi e 99Food. Minha abordagem e centrada em pesquisa com usuarios reais.',
        11000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 28 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        9,
        5,
        1,
        'Tenho experiencia com React e TypeScript e ja estudei a plataforma VTEX IO. Consigo desenvolver a app de checkout customizado seguindo os padroes da plataforma.',
        22000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 55 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        10,
        5,
        3,
        'Especialista em React/TypeScript com experiencia em plataformas de e-commerce. Ja desenvolvi checkouts customizados para grandes marcas.',
        27000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 50 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        criado_em
    )
VALUES (
        11,
        6,
        1,
        'Experiencia com React + Flask e ja trabalhei com WebSocket e MQTT em projetos IoT. Posso entregar o dashboard completo com alertas em tempo real.',
        13000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 40 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        12,
        6,
        2,
        'Engenheira backend com experiencia em sistemas real-time. Ja implementei dashboards de monitoramento para infraestrutura critica.',
        15000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 42 DAY)
        ),
        'pendente',
        DATE_SUB(NOW(), INTERVAL 4 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        respondido_em,
        criado_em
    )
VALUES (
        13,
        8,
        3,
        'Especialista em landing pages de alta conversao com animacoes GSAP. Portfolio com exemplos de pages para fintechs.',
        4500.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 12 DAY)
        ),
        'aceita',
        DATE_SUB(NOW(), INTERVAL 25 DAY),
        DATE_SUB(NOW(), INTERVAL 28 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        respondido_em,
        criado_em
    )
VALUES (
        14,
        9,
        5,
        'Cientista de dados com vasta experiencia em automacao de relatorios de marketing. Domino as APIs do Google Ads e Meta.',
        9500.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 25 DAY)
        ),
        'aceita',
        DATE_SUB(NOW(), INTERVAL 55 DAY),
        DATE_SUB(NOW(), INTERVAL 58 DAY)
    );

INSERT INTO
    proposals (
        id,
        job_id,
        freelancer_id,
        mensagem,
        valor_proposto,
        prazo_proposto,
        status,
        respondido_em,
        criado_em
    )
VALUES (
        15,
        10,
        4,
        'Designer especialista em design systems. Criei o DS da Resultados Digitais e da Conta Azul. Entrego com documentacao completa e tokens exportaveis.',
        18000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 55 DAY)
        ),
        'aceita',
        DATE_SUB(NOW(), INTERVAL 85 DAY),
        DATE_SUB(NOW(), INTERVAL 88 DAY)
    );

INSERT INTO
    contracts (
        id,
        job_id,
        proposal_id,
        company_id,
        freelancer_id,
        valor_final,
        prazo_final,
        status,
        iniciado_em,
        concluido_em
    )
VALUES (
        1,
        8,
        13,
        3,
        3,
        4500.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 12 DAY)
        ),
        'em_andamento',
        DATE_SUB(NOW(), INTERVAL 25 DAY),
        NULL
    ),
    (
        2,
        9,
        14,
        4,
        5,
        9500.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 25 DAY)
        ),
        'concluido',
        DATE_SUB(NOW(), INTERVAL 55 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY)
    ),
    (
        3,
        10,
        15,
        2,
        4,
        18000.00,
        DATE(
            DATE_ADD(NOW(), INTERVAL 55 DAY)
        ),
        'concluido',
        DATE_SUB(NOW(), INTERVAL 85 DAY),
        DATE_SUB(NOW(), INTERVAL 20 DAY)
    );

INSERT INTO
    reviews (
        contract_id,
        avaliador_tipo,
        avaliado_user_id,
        nota,
        comentario,
        criado_em
    )
VALUES (
        2,
        'empresa',
        14,
        5,
        'Lucas entregou um trabalho excepcional! O pipeline de automacao superou nossas expectativas. Comunicacao excelente e entrega antes do prazo. Recomendo fortemente.',
        DATE_SUB(NOW(), INTERVAL 9 DAY)
    );

INSERT INTO
    reviews (
        contract_id,
        avaliador_tipo,
        avaliado_user_id,
        nota,
        comentario,
        criado_em
    )
VALUES (
        2,
        'freelancer',
        4,
        5,
        'O iFood foi incrivel para trabalhar! Briefing claro desde o inicio, acesso a todas as APIs necessarias e feedback construtivo em cada etapa. Pagamento pontual. Excelente experiencia!',
        DATE_SUB(NOW(), INTERVAL 8 DAY)
    );

INSERT INTO
    reviews (
        contract_id,
        avaliador_tipo,
        avaliado_user_id,
        nota,
        comentario,
        criado_em
    )
VALUES (
        3,
        'empresa',
        13,
        5,
        'Carolina criou um design system de altissima qualidade. Componentes bem organizados, documentacao impecavel e tokens perfeitamente estruturados. Profissional excelente!',
        DATE_SUB(NOW(), INTERVAL 19 DAY)
    );

INSERT INTO
    reviews (
        contract_id,
        avaliador_tipo,
        avaliado_user_id,
        nota,
        comentario,
        criado_em
    )
VALUES (
        3,
        'freelancer',
        2,
        4,
        'Otima experiencia! Equipe muito profissional e organizada. O briefing inicial foi bem detalhado. Unico ponto seria mais agilidade nas aprovacoes, mas no geral foi excelente.',
        DATE_SUB(NOW(), INTERVAL 18 DAY)
    );

-- ─── NOTIFICAÇÕES DEMO ──────────────────────────────────────
DELETE FROM notifications;

INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, link, criado_em) VALUES
-- Mateus Vieira (user_id=10, freelancer)
(10, 'proposta_aceita',   'Sua proposta foi aceita! 🎉', 'A VTEX aceitou sua proposta para "App VTEX IO para checkout customizado". Contrato criado.', 0, 'contratos.html', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 'nova_avaliacao',    'Você recebeu uma avaliação ⭐', 'O iFood avaliou seu trabalho no projeto de automação de relatórios com nota 5.', 1, 'perfil-freelancer.html', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(10, 'proposta_recusada', 'Proposta não selecionada', 'Sua proposta para "Landing page Nubank Ultravioleta" não foi selecionada desta vez.', 1, 'propostas.html', DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- empresa TOTVS (user_id=1)
(1, 'nova_proposta', 'Nova proposta recebida 👥', 'Rafael Souza enviou uma proposta para "Módulo de relatórios TOTVS Protheus". Confira!', 0, 'dash_empresa.html', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 'nova_proposta', 'Nova proposta recebida 👥', 'Ana Costa enviou uma proposta para "Módulo de relatórios TOTVS Protheus". Confira!', 0, 'dash_empresa.html', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'nova_proposta', 'Nova proposta recebida 👥', 'Mateus Vieira enviou uma proposta para "App mobile força de vendas". Confira!', 1, 'dash_empresa.html', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- empresa iFood (user_id=4)
(4, 'contrato_concluido', 'Contrato concluído ✅', 'O projeto "Automação de relatórios de marketing" foi marcado como concluído por Lucas Ferreira.', 1, 'contratos.html', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'nova_proposta',      'Nova proposta recebida 👥', 'Carolina Mendes enviou uma proposta para "Redesign fluxo de pedidos iFood".', 0, 'dash_empresa.html', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Lucas Ferreira (user_id=14, freelancer)
(14, 'proposta_aceita', 'Proposta aceita! 🎉', 'O iFood aceitou sua proposta para "Automação de relatórios de marketing iFood". Bom trabalho!', 1, 'contratos.html', DATE_SUB(NOW(), INTERVAL 55 DAY)),
(14, 'nova_avaliacao',  'Você recebeu uma avaliação ⭐', 'O iFood avaliou seu trabalho com nota 5. Parabéns pela entrega excelente!', 1, 'perfil-freelancer.html', DATE_SUB(NOW(), INTERVAL 9 DAY));