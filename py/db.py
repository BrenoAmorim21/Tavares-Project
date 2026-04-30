# ============================================================
#  WorkFinder — py/db.py
#  Centraliza a conexão com o banco e helpers de query
# ============================================================

import mysql.connector
from config import Config


def get_conn():
    """Abre e retorna uma conexão com o Azure MySQL."""
    return mysql.connector.connect(**Config.get_db_config())


def query_one(sql, params=()):
    """Executa uma query e retorna um único registro (dict) ou None."""
    conn = get_conn()
    cur  = conn.cursor(dictionary=True)
    try:
        cur.execute(sql, params)
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()


def query_all(sql, params=()):
    """Executa uma query e retorna uma lista de registros (dicts)."""
    conn = get_conn()
    cur  = conn.cursor(dictionary=True)
    try:
        cur.execute(sql, params)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def execute(sql, params=(), return_lastrowid=False):
    """
    Executa INSERT / UPDATE / DELETE com commit automático.
    Se return_lastrowid=True, retorna o id gerado.
    """
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute(sql, params)
        conn.commit()
        return cur.lastrowid if return_lastrowid else cur.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def criar_notificacao(user_id, tipo, titulo, mensagem, link=None):
    """Cria uma notificação para o usuário. Falha silenciosa para não quebrar o fluxo principal."""
    try:
        execute(
            'INSERT INTO notifications (user_id, tipo, titulo, mensagem, link) VALUES (%s,%s,%s,%s,%s)',
            (user_id, tipo, titulo, mensagem, link)
        )
    except Exception:
        pass