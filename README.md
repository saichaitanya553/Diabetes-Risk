# GlucoSense — Diabetes Risk Prediction

An AI-powered diabetes risk screening tool that turns routine health
measurements into an interpretable risk assessment. Built with a
**React** frontend, a **FastAPI** backend, and an **XGBoost** classifier
trained on the Pima Indians Diabetes dataset.

Unlike a plain "risk score" output, GlucoSense explains *why* it reached
that score for each individual user (via SHAP), flags which inputs are
outside typical clinical ranges, and stays usable even if the backend
is temporarily unreachable via a transparent offline fallback estimate.

---

## Why this exists

Diabetes often develops silently — by the time symptoms appear, it may
already be advanced. Early, low-friction screening based on a handful
of easily measurable values (glucose, BMI, blood pressure, etc.) can
prompt someone to seek proper clinical testing sooner. This project is
a screening *aid*, not a diagnostic tool — it's explicit about that
throughout the app.

---

## Features

- **Risk prediction** from 8 clinical inputs, powered by a tuned XGBoost model
- **Per-prediction explainability** — SHAP values show exactly which
  factors pushed *this* user's score up or down, and by how much
- **Clinical range flagging** — inputs like glucose and BMI are compared
  against standard reference ranges
- **Model transparency page** — real accuracy/precision/recall/ROC-AUC
  and cross-validation results, not marketing copy
- **Downloadable PDF report** — your submitted values vs. the dataset
  average and vs. the average among diabetic cases in the dataset,
  plus the risk score, top contributing factors, and recommendations
- **Local prediction history** — stored in the browser, no account needed
- **Offline fallback** — if the FastAPI backend is unreachable, a
  clearly-labeled rule-based estimator keeps the app usable
- **Input validation** and a one-click demo data generator for quick testing

---

## Tech stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React 19 + Vite, React Router                 |
| Backend    | FastAPI, Pydantic                             |
| ML         | XGBoost, scikit-learn, SHAP                   |
| Data       | Pima Indians Diabetes dataset (768 records)   |

---

## Project structure

```
Diabetes-risk-prediction/
├── backend/
│   └── app.py                 # FastAPI app — /predict, /model-info, /health
├── src/
│   └── ml_predict.py          # Model loading, prediction, SHAP explanation logic
├── models/
│   ├── diabetes_model.pkl     # Trained XGBoost model + feature list
│   └── model_metrics.json     # Evaluation metrics served to the frontend
├── notebooks/
│   └── diabetes_model.ipynb   # Full training pipeline: EDA, model comparison,
│                               # cross-validation, hyperparameter tuning
├── dataset/
│   └── diabetes_cleaned.csv   # Cleaned Pima Indians Diabetes dataset
├── frontend/
│   ├── src/
│   │   ├── pages/             # Home, Predict, History, About
│   │   ├── components/        # PatientForm, PredictionResult, etc.
│   │   └── services/
│   │       ├── api.js               # Backend calls
│   │       └── offlineEstimator.js  # Rule-based fallback
│   └── ...
└── requirements.txt
```

---

## Getting started

### 1. Backend (FastAPI)

```bash
# from the project root
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn backend.app:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000`. Interactive docs at
`http://127.0.0.1:8000/docs`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install

# Point the frontend at your backend
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.local

npm run dev
```

The app will be live at `http://localhost:5173`.

### 3. Verify everything works

```bash
# Backend health check
curl http://127.0.0.1:8000/health

# Sample prediction
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"glucose":150,"blood_pressure":80,"bmi":32,"age":45,"insulin":120,"pregnancies":2,"skin_thickness":25,"diabetes_pedigree_function":0.5}'
```

---

## API reference

### `POST /predict`

**Request body:**

| Field                          | Type  | Required | Notes                              |
|---------------------------------|-------|----------|-------------------------------------|
| `glucose`                       | float | yes      | mg/dL                                |
| `blood_pressure`                | float | yes      | mm Hg                                |
| `bmi`                           | float | yes      | kg/m²                                |
| `age`                           | float | yes      | years                                 |
| `insulin`                       | float | yes      | μU/mL                                 |
| `pregnancies`                   | float | no       | default 0                             |
| `skin_thickness`                | float | no       | default 20 (mm)                       |
| `diabetes_pedigree_function`    | float | no       | default 0.3 (family history score)    |

**Response:**

```json
{
  "risk_percentage": 84.35,
  "risk_level": "High Risk",
  "recommendations": ["Regular Exercise", "Sugar Control", "Quarterly Health Check-up"],
  "feature_contributions": [
    {
      "feature": "Age",
      "label": "Age",
      "value": 45.0,
      "unit": "years",
      "influence_share": 36.8,
      "direction": "increases_risk",
      "range_flag": null
    }
  ],
  "top_factors": ["Age", "Glucose", "Blood Pressure"]
}
```

### `GET /model-info`

Returns the trained model's evaluation metrics, confusion matrix,
feature list, and hyperparameters — used by the frontend's About page.

### `GET /health`

Basic liveness check.

---

## Model methodology

Full pipeline is in `notebooks/diabetes_model.ipynb`:

1. **EDA** — null/duplicate checks, class balance, correlation analysis
2. **Model comparison** — Logistic Regression, Decision Tree, Random
   Forest, SVM, and XGBoost evaluated on the same train/test split
3. **Hyperparameter tuning** — `RandomizedSearchCV` over XGBoost's
   `n_estimators`, `max_depth`, `learning_rate`, `subsample`,
   `colsample_bytree`, `min_child_weight`, and `gamma`
4. **Validation** — 5-fold stratified cross-validation to confirm the
   holdout results generalize rather than reflecting one lucky split

**Final model:** XGBoost (`n_estimators=200`, `max_depth=4`,
`learning_rate=0.05`, `subsample=0.8`, `colsample_bytree=0.8`), trained
on all 8 original Pima dataset features.

| Metric     | Holdout test | 5-fold CV |
|------------|:------------:|:---------:|
| Accuracy   | 87.01%       | 88.03%    |
| Precision  | 81.48%       | 84.39%    |
| Recall     | 81.48%       | 80.99%    |
| F1 Score   | 81.48%       | 82.59%    |
| ROC-AUC    | 95.30%       | 94.92%    |

Per-prediction explanations use `shap.TreeExplainer` on the trained
model, reported as each feature's **share of total influence** on that
specific prediction (not a raw log-odds value, to avoid implying more
numerical precision than the underlying SHAP math supports).

---

## Limitations & disclaimer

- Trained on the Pima Indians Diabetes dataset (768 records, female
  patients aged 21+), so it does not generalize to all populations.
- The offline fallback estimator is a simplified rule-based heuristic
  using standard clinical thresholds — it is **not** the trained ML
  model and is only used when the backend is unreachable.
- **This tool is for educational and screening purposes only.** It is
  not a medical diagnosis and should not replace professional medical
  advice, testing, or treatment.

---

## Roadmap / possible extensions

- Persisted (server-side) prediction history with trend charts
- Deployment configs for Render/Railway (backend) + Vercel (frontend)
