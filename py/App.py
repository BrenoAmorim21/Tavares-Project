import os
from flask import Flask, send_from_directory, redirect
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.proposals import proposals_bp
from routes.contracts import contracts_bp
from routes.reviews import reviews_bp
from routes.users import users_bp
from routes.stats import stats_bp
from routes.notifications import notif_bp
from routes.messages import messages_bp

# Caminho pra raiz do projeto (pasta Tavares/), onde estão pages/, assets/ e index.html
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

app = Flask(__name__, static_folder=None)
app.config.from_object(Config)
CORS(app)

# ── API blueprints ──────────────────────────────────────────
app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(jobs_bp,      url_prefix='/api/vagas')
app.register_blueprint(proposals_bp, url_prefix='/api/propostas')
app.register_blueprint(contracts_bp, url_prefix='/api/contratos')
app.register_blueprint(reviews_bp,   url_prefix='/api/avaliacoes')
app.register_blueprint(users_bp,     url_prefix='/api/usuarios')
app.register_blueprint(stats_bp,     url_prefix='/api/stats')
app.register_blueprint(notif_bp,     url_prefix='/api/notificacoes')
app.register_blueprint(messages_bp,  url_prefix='/api/mensagens')

@app.route('/api/ping')
def ping():
    return {'status': 'ok', 'mensagem': 'WorkFinder API rodando'}

# ── Frontend estático ───────────────────────────────────────
@app.route('/')
def home():
    return send_from_directory(ROOT, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    """Serve qualquer arquivo de assets/, pages/, BD/ etc.
       Se o arquivo não existir, retorna o index.html (SPA-style fallback)."""
    full = os.path.join(ROOT, path)
    if os.path.isfile(full):
        return send_from_directory(ROOT, path)
    return send_from_directory(ROOT, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)