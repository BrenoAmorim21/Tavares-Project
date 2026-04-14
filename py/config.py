# ============================================================
#  WorkFinder — py/config.py
#  Configurações Flask + Azure MySQL (com SSL obrigatório)
# ============================================================

import os
from dotenv import load_dotenv

load_dotenv()   # Lê o arquivo .env na raiz do projeto

class Config:
    # ── Segurança ──────────────────────────────────────────
    SECRET_KEY = os.getenv('SECRET_KEY', 'troque-esta-chave-em-producao')
    JWT_SECRET = os.getenv('JWT_SECRET', 'jwt-secret-troque-em-producao')
    JWT_EXPIRY_DAYS = int(os.getenv('JWT_EXPIRY_DAYS', 7))

    # ── Banco de dados (Azure Database for MySQL) ──────────
    DB_HOST     = os.getenv('DB_HOST')          # engcomp5.mysql.database.azure.com
    DB_PORT     = int(os.getenv('DB_PORT', 3306))
    DB_NAME     = os.getenv('DB_NAME', 'workfinder')
    DB_USER     = os.getenv('DB_USER')          # BrunoADSP@engcomp5
    DB_PASSWORD = os.getenv('DB_PASSWORD')

    # Azure exige SSL — certificado baixado do portal Azure
    # Baixe em: https://dl.cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
    DB_SSL_CA   = os.getenv('DB_SSL_CA', 'certs/DigiCertGlobalRootCA.crt.pem')


    @classmethod
    def get_db_config(cls):
        """Retorna dicionário de conexão para mysql.connector"""
        cfg = {
            'host':     cls.DB_HOST,
            'port':     cls.DB_PORT,
            'database': cls.DB_NAME,
            'user':     cls.DB_USER,
            'password': cls.DB_PASSWORD,
            'charset':  'utf8mb4',
        }
        # Adiciona SSL se o certificado existir
        import os as _os
        if cls.DB_SSL_CA and _os.path.exists(cls.DB_SSL_CA):
            cfg['ssl_ca']     = cls.DB_SSL_CA
            cfg['ssl_verify_cert'] = True
        return cfg