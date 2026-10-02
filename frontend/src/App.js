import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' && window.location.port === '3000' 
    ? 'http://localhost:5000' 
    : '');

// ─── 5 Test Entry Presets ───────────────────────────────────────────────────
const TEST_ENTRIES = [
  {
    id: 1,
    title: 'Fast Food Lunch Peak',
    icon: '🍕',
    desc: 'Weekday lunch rush order',
    data: {
      market_id: 1,
      store_primary_category: 2, // Fast Food
      order_protocol: 1,
      total_items: 4,
      subtotal: 1800,
      num_distinct_items: 2,
      min_item_price: 300,
      max_item_price: 700,
      total_onshift_partners: 25,
      total_busy_partners: 20,
      total_outstanding_orders: 15,
      order_hour: 13,
      order_day_of_week: 2, // Wednesday
      is_weekend: 0,
    },
  },
  {
    id: 2,
    title: 'Weekend Dinner Feast',
    icon: '🍣',
    desc: 'Heavy Saturday night surge',
    data: {
      market_id: 2,
      store_primary_category: 1, // Asian
      order_protocol: 3,
      total_items: 8,
      subtotal: 5400,
      num_distinct_items: 5,
      min_item_price: 450,
      max_item_price: 1800,
      total_onshift_partners: 12,
      total_busy_partners: 11,
      total_outstanding_orders: 28,
      order_hour: 20,
      order_day_of_week: 5, // Saturday
      is_weekend: 1,
    },
  },
  {
    id: 3,
    title: 'Early Morning Bakery',
    icon: '☕',
    desc: 'Low traffic breakfast delivery',
    data: {
      market_id: 1,
      store_primary_category: 5, // Other
      order_protocol: 2,
      total_items: 2,
      subtotal: 950,
      num_distinct_items: 2,
      min_item_price: 350,
      max_item_price: 600,
      total_onshift_partners: 30,
      total_busy_partners: 5,
      total_outstanding_orders: 4,
      order_hour: 8,
      order_day_of_week: 1, // Tuesday
      is_weekend: 0,
    },
  },
  {
    id: 4,
    title: 'Late Night Cravings',
    icon: '🍔',
    desc: 'Midnight snack order',
    data: {
      market_id: 3,
      store_primary_category: 0, // American
      order_protocol: 1,
      total_items: 3,
      subtotal: 2200,
      num_distinct_items: 2,
      min_item_price: 500,
      max_item_price: 1200,
      total_onshift_partners: 8,
      total_busy_partners: 6,
      total_outstanding_orders: 7,
      order_hour: 23,
      order_day_of_week: 4, // Friday
      is_weekend: 0,
    },
  },
  {
    id: 5,
    title: 'Sunday Italian Feast',
    icon: '🍝',
    desc: 'Sunday evening family order',
    data: {
      market_id: 2,
      store_primary_category: 3, // Italian
      order_protocol: 4,
      total_items: 6,
      subtotal: 4200,
      num_distinct_items: 4,
      min_item_price: 600,
      max_item_price: 1500,
      total_onshift_partners: 18,
      total_busy_partners: 16,
      total_outstanding_orders: 22,
      order_hour: 19,
      order_day_of_week: 6, // Sunday
      is_weekend: 1,
    },
  },
];

// ─── Circular Timer Component ─────────────────────────────────────────────────
function CircularTimer({ minutes }) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  // Cap visual at 120 min for full circle
  const pct = Math.min(minutes / 120, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="timer-wrap fade-up">
      <svg className="timer-svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle className="timer-track" cx="100" cy="100" r={radius} />
        <circle
          className="timer-progress"
          cx="100"
          cy="100"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="timer-center">
        <span className="timer-value">{Math.round(minutes)}</span>
        <span className="timer-unit">Minutes</span>
      </div>
    </div>
  );
}

// ─── Form field definitions ───────────────────────────────────────────────────
const STORE_CATEGORIES = [
  { value: 0, label: 'American' },
  { value: 1, label: 'Asian' },
  { value: 2, label: 'Fast Food' },
  { value: 3, label: 'Italian' },
  { value: 4, label: 'Mexican' },
  { value: 5, label: 'Other' },
  { value: 6, label: 'Pizza' },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [featureCols, setFeatureCols] = useState([]);
  const [formData, setFormData] = useState({});
  const [activePreset, setActivePreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ── Check backend health + load features ───────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        setApiStatus('online');
        setFeatureCols(data.features || []);
        // Init form with empty values if not set yet
        setFormData(prev => {
          if (Object.keys(prev).length > 0) return prev;
          const init = {};
          (data.features || []).forEach(col => { init[col] = ''; });
          return init;
        });
      } catch {
        setApiStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setActivePreset(null);
    setError(null);
  };

  const loadPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData(preset.data);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {};
      Object.keys(formData).forEach(k => {
        payload[k] = parseFloat(formData[k]) || 0;
      });

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // ── Smart label renderer ───────────────────────────────────────────────────
  const renderField = (col) => {
    const label = col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    if (col === 'store_primary_category') {
      return (
        <div className="form-group" key={col}>
          <label htmlFor={col}>{label}</label>
          <select id={col} name={col} value={formData[col] ?? ''} onChange={handleChange}>
            <option value="">Select category...</option>
            {STORE_CATEGORIES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (col === 'is_weekend') {
      return (
        <div className="form-group" key={col}>
          <label htmlFor={col}>{label}</label>
          <select id={col} name={col} value={formData[col] ?? ''} onChange={handleChange}>
            <option value="">Select...</option>
            <option value={1}>Yes (Weekend)</option>
            <option value={0}>No (Weekday)</option>
          </select>
        </div>
      );
    }

    if (col === 'order_hour') {
      return (
        <div className="form-group" key={col}>
          <label htmlFor={col}>Order Hour (0–23)</label>
          <input
            type="number" id={col} name={col}
            min={0} max={23} step={1}
            placeholder="e.g. 14"
            value={formData[col] ?? ''} onChange={handleChange}
          />
        </div>
      );
    }

    if (col === 'order_day_of_week') {
      return (
        <div className="form-group" key={col}>
          <label htmlFor={col}>Day of Week</label>
          <select id={col} name={col} value={formData[col] ?? ''} onChange={handleChange}>
            <option value="">Select day...</option>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="form-group" key={col}>
        <label htmlFor={col}>{label}</label>
        <input
          type="number" id={col} name={col}
          step="any" placeholder="Enter value"
          value={formData[col] ?? ''} onChange={handleChange}
        />
      </div>
    );
  };

  const statusLabel = { online: 'API Online', offline: 'API Offline', checking: 'Connecting…' };

  return (
    <div className="app-container">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">🚚</div>
          <span className="logo-text">Porter AI</span>
        </div>
        <div className="api-status">
          <span className={`status-dot ${apiStatus}`} />
          {statusLabel[apiStatus]}
        </div>
        <div className="header-badge">XGBoost · Delivery Prediction</div>
      </header>

      {/* Main */}
      <main className="main">
        <h1 className="page-title">Delivery Time Estimator</h1>
        <p className="page-subtitle">
          AI-powered delivery duration prediction using the trained Porter XGBoost model
        </p>

        {/* ── 5 Test Entries Bar ── */}
        <div className="presets-section">
          <div className="presets-header">
            <span className="presets-icon">⚡</span>
            <span className="presets-title">Quick Test Presets (Click to Populate Form):</span>
          </div>
          <div className="presets-grid">
            {TEST_ENTRIES.map(preset => (
              <button
                key={preset.id}
                type="button"
                className={`preset-card ${activePreset === preset.id ? 'active' : ''}`}
                onClick={() => loadPreset(preset)}
                title={preset.desc}
              >
                <div className="preset-card-top">
                  <span className="preset-icon">{preset.icon}</span>
                  <span className="preset-number">#{preset.id}</span>
                </div>
                <div className="preset-card-title">{preset.title}</div>
                <div className="preset-card-desc">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {/* ── Left: Input Form ── */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">📋</div>
              <h2 className="card-title">Input Delivery Details</h2>
              {activePreset && (
                <span className="active-preset-badge">
                  Loaded Preset #{activePreset}
                </span>
              )}
            </div>

            {apiStatus === 'offline' && (
              <div className="error-box">
                ⚠️ Backend is offline. Start the Flask server: <code>python backend/app.py</code>
              </div>
            )}

            {featureCols.length === 0 && apiStatus !== 'offline' && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                ⏳ Connecting to backend…
              </p>
            )}

            {featureCols.length > 0 && (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {featureCols.map(col => renderField(col))}
                </div>

                {error && (
                  <div className="error-box">⚠️ {error}</div>
                )}

                <button
                  type="submit"
                  className="predict-btn"
                  disabled={loading || apiStatus === 'offline'}
                  id="predict-button"
                >
                  {loading ? (
                    <><span className="btn-loader" />Predicting…</>
                  ) : (
                    '⚡ Predict Delivery Time'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Result Panel ── */}
          <div className="card result-panel">
            <div className="card-header">
              <div className="card-icon">⏱️</div>
              <h2 className="card-title">Estimated Delivery Time</h2>
            </div>

            {!result ? (
              <div className="result-idle">
                <div className="result-idle-icon">🚀</div>
                <p>Select a <strong>Test Preset</strong> above or fill in the fields and click <strong>Predict</strong>.</p>
              </div>
            ) : (
              <>
                <CircularTimer minutes={result.predicted_minutes} />
                <div className="result-display">{result.predicted_display}</div>
                <div className="result-note">Estimated delivery duration</div>

                <div className="stats-row">
                  <div className="stat-chip">
                    <div className="stat-chip-label">Minutes</div>
                    <div className="stat-chip-value">{result.predicted_minutes}</div>
                  </div>
                  <div className="stat-chip">
                    <div className="stat-chip-label">Category</div>
                    <div className="stat-chip-value">
                      {result.predicted_minutes < 30 ? 'Fast 🟢' : result.predicted_minutes < 60 ? 'Normal 🟡' : 'Slow 🔴'}
                    </div>
                  </div>
                  <div className="stat-chip">
                    <div className="stat-chip-label">Model</div>
                    <div className="stat-chip-value">XGBoost</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
