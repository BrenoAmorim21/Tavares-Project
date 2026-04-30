from flask import Flask
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

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(jobs_bp,      url_prefix='/api/vagas')
app.register_blueprint(proposals_bp, url_prefix='/api/propostas')
app.register_blueprint(contracts_bp, url_prefix='/api/contratos')
app.register_blueprint(reviews_bp,   url_prefix='/api/avaliacoes')
app.register_blueprint(users_bp,     url_prefix='/api/usuarios')
app.register_blueprint(stats_bp,     url_prefix='/api/stats')
app.register_blueprint(notif_bp,     url_prefix='/api/notificacoes')

@app.route('/api/ping')
def ping():
    return {'status': 'ok', 'mensagem': 'WorkFinder API rodando'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
