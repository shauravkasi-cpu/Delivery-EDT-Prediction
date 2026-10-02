from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ─── Load artifacts ────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE_DIR, "model.pkl"), "rb") as f:
    model = pickle.load(f)

with open(os.path.join(BASE_DIR, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE_DIR, "feature_columns.pkl"), "rb") as f:
    feature_columns = pickle.load(f)

print(f"[OK] Loaded model. Features required: {feature_columns}")

# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "features": feature_columns})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        # Build feature array in the correct order
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
def get_features():
    return jsonify({"features": feature_columns})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
