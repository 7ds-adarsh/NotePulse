from flask import Flask
from flask_cors import CORS
from app.extensions import db

def create_app():
    app = Flask(__name__) # create the app

    app.config["SECRET_KEY"] = "dev" # basic config (we'll expand later)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "https://note-pulse-five.vercel.app"]) # allow CORS for our frontend
    
    db.init_app(app)  # 🔥 connect DB
    
    # register routes
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    from app.routes.notes import notes_bp
    app.register_blueprint(notes_bp, url_prefix="/api/notes")
    from app.routes.stats import stats_bp
    app.register_blueprint(stats_bp, url_prefix="/api/stats")

    return app

