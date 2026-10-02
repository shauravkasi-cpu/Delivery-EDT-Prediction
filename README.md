# 🚚 Porter Delivery Time (EDT) Prediction
Link to website: https://porter-edt-prediction.onrender.com/

An end-to-end Machine Learning web application that predicts food/package delivery duration (in minutes) for **Porter**, featuring an **XGBoost Regressor**, **Flask REST API**, and a modern **React JS Web Dashboard** with 5 interactive test presets.

---

## 🌟 Key Features

- **XGBoost Machine Learning Model**: Trained on real delivery order metrics (order time, item prices, active delivery partners, market ID, store category, etc.).
- **PKL Serialization**: Saved trained `XGBRegressor` model, `StandardScaler`, and feature schema for fast inference.
- **Flask REST API**: Serves predictions on `/predict` and model metadata on `/health`.
- **Modern React JS Dashboard**: Dark glassmorphism UI with circular animated timer display, live API status indicator, and input validation.
- **5 Quick Test Presets**: Clickable scenario buttons (Lunch Rush, Weekend Dinner, Morning Bakery, Late Night Snack, Sunday Family Dinner) that auto-fill sample test data into the prediction form.

---

## 📁 Repository Structure

```
Delivery-EDT-Prediction/
├── Porter (1).py            # Machine Learning training & evaluation script
├── Porter_DataSet.csv       # Porter delivery dataset
├── backend/
│   ├── app.py               # Flask REST API
│   ├── model.pkl            # Serialized XGBoost model
│   ├── scaler.pkl           # Serialized StandardScaler
│   └── feature_columns.pkl  # Required feature order
└── frontend/                # React JS Web UI
    ├── public/
    └── src/
        ├── App.js           # Main React Dashboard component
        └── App.css          # Glassmorphism dark theme styles
```

---

## 🚀 Quick Start

### 1. Model Training & PKL Generation
```bash
python "Porter (1).py"
```

### 2. Start Flask Backend API
```bash
python backend/app.py
```
*API runs at `http://localhost:5000`*

### 3. Start React Frontend UI
```bash
cd frontend
npm install
npm start
```
*UI opens at `http://localhost:3000`*

---

## 📊 Model Performance

- **Model**: XGBoost Regressor (`n_estimators=1000`, `learning_rate=0.1`, `max_depth=4`)
- **Mean Absolute Error (MAE)**: ~11.17 minutes
- **R² Score**: ~0.3227

---

## 💻 Tech Stack

- **ML Framework**: Python, XGBoost, Scikit-Learn, Pandas, NumPy, Pickle
- **Backend API**: Python, Flask, Flask-CORS
- **Frontend UI**: React JS, HTML5, Vanilla CSS3 (Glassmorphism & CSS Grid)
