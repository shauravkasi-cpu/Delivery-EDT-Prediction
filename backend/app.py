from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import numpy as np
import os

# ─── Determine directory paths ────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_BUILD = os.path.join(ROOT_DIR, "frontend", "build")

if os.path.exists(FRONTEND_BUILD):
    app = Flask(__name__, static_folder=FRONTEND_BUILD, static_url_path="")
else:
    app = Flask(__name__)

CORS(app)

# ─── Load artifacts ────────────────────────────────────────────────────────────
with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE_DIR, "feature_columns.pkl"), "rb") as f:
    feature_columns = pickle.load(f)

print(f"[OK] Loaded model. Features required: {feature_columns}")

# ─── API Routes ────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "features": feature_columns})


@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        values = []
        missing = []
        for col in feature_columns:
            if col not in data:
                missing.append(col)
            else:
                values.append(float(data[col]))

        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        X = np.array(values).reshape(1, -1)
        X_scaled = scaler.transform(X)
        prediction = model.predict(X_scaled)[0]

        hours = int(prediction // 60)
        minutes = int(prediction % 60)

        return jsonify({
            "predicted_minutes": round(float(prediction), 2),
            "predicted_display": f"{hours}h {minutes}m" if hours > 0 else f"{minutes} min"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/features", methods=["GET"])
@app.route("/api/features", methods=["GET"])
def get_features():
    return jsonify({"features": feature_columns})


# ─── Static Frontend Serving (For single-service Render deployment) ───────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if os.path.exists(FRONTEND_BUILD):
        if path != "" and os.path.exists(os.path.join(FRONTEND_BUILD, path)):
            return send_from_directory(FRONTEND_BUILD, path)
        else:
            return send_from_directory(FRONTEND_BUILD, "index.html")
    return jsonify({"message": "Porter AI API is running. Build frontend to see UI."})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
