import json
from pathlib import Path

import joblib
import pandas as pd
import shap


# ---------------------------------------------------------
# MODEL PATH
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "diabetes_model.pkl"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"


# ---------------------------------------------------------
# LOAD TRAINED MODEL
# ---------------------------------------------------------

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found at: {MODEL_PATH}"
    )

model_data = joblib.load(MODEL_PATH)

if not isinstance(model_data, dict):
    raise TypeError(
        "The saved model file must contain a dictionary "
        "with 'model' and 'features'."
    )

if "model" not in model_data:
    raise KeyError("The trained model file does not contain 'model'.")

if "features" not in model_data:
    raise KeyError("The trained model file does not contain 'features'.")

model = model_data["model"]
features = model_data["features"]

# SHAP explainer built once at import time (fast for tree models)
explainer = shap.TreeExplainer(model)

# Human-readable labels + units for explanation output
FEATURE_META = {
    "Pregnancies": {"label": "Pregnancies", "unit": ""},
    "Glucose": {"label": "Glucose", "unit": "mg/dL"},
    "BloodPressure": {"label": "Blood Pressure", "unit": "mm Hg"},
    "SkinThickness": {"label": "Skin Thickness", "unit": "mm"},
    "Insulin": {"label": "Insulin", "unit": "\u03bcU/mL"},
    "BMI": {"label": "BMI", "unit": "kg/m\u00b2"},
    "DiabetesPedigreeFunction": {"label": "Family History Score", "unit": ""},
    "Age": {"label": "Age", "unit": "years"},
}


# ---------------------------------------------------------
# RECOMMENDATIONS
# ---------------------------------------------------------

def get_recommendations(risk_level: str) -> list[str]:
    if risk_level == "High Risk":
        return [
            "Regular Exercise",
            "Sugar Control",
            "Quarterly Health Check-up",
        ]

    if risk_level == "Moderate Risk":
        return [
            "Regular Exercise",
            "Reduce Sugar and Refined Carbohydrates",
            "Quarterly Health Check-up",
        ]

    return [
        "Maintain Regular Exercise",
        "Maintain Healthy Sugar Intake",
        "Routine Health Check-up",
    ]


# ---------------------------------------------------------
# CLINICAL REFERENCE RANGES (for flagging + reporting)
# ---------------------------------------------------------

CLINICAL_RANGES = {
    "Glucose": {"normal_min": 70, "normal_max": 99, "elevated_max": 125, "unit": "mg/dL"},
    "BloodPressure": {"normal_min": 60, "normal_max": 80, "elevated_max": 89, "unit": "mm Hg"},
    "BMI": {"normal_min": 18.5, "normal_max": 24.9, "elevated_max": 29.9, "unit": "kg/m\u00b2"},
    "Insulin": {"normal_min": 16, "normal_max": 166, "elevated_max": 276, "unit": "\u03bcU/mL"},
}


def get_range_flag(feature: str, value: float) -> str | None:
    ref = CLINICAL_RANGES.get(feature)
    if ref is None:
        return None
    if value <= ref["normal_max"]:
        return "normal"
    if value <= ref["elevated_max"]:
        return "elevated"
    return "high"


def get_normal_range_label(feature: str) -> str | None:
    """Human-readable normal reference range, e.g. '70-99 mg/dL'."""
    ref = CLINICAL_RANGES.get(feature)
    if ref is None:
        return None
    unit = f" {ref['unit']}" if ref["unit"] else ""
    return f"{ref['normal_min']}-{ref['normal_max']}{unit}"


# ---------------------------------------------------------
# MODEL METRICS (for the "About the Model" page)
# ---------------------------------------------------------

def get_model_metrics() -> dict:
    if not METRICS_PATH.exists():
        return {}
    with open(METRICS_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------
# PREDICTION
# ---------------------------------------------------------

def predict_diabetes_risk(
    glucose: float,
    blood_pressure: float,
    bmi: float,
    age: float,
    insulin: float,
    pregnancies: float = 0,
    skin_thickness: float = 20,
    diabetes_pedigree_function: float = 0.3,
) -> dict:

    raw_values = {
        "Pregnancies": pregnancies,
        "Glucose": glucose,
        "BloodPressure": blood_pressure,
        "SkinThickness": skin_thickness,
        "Insulin": insulin,
        "BMI": bmi,
        "DiabetesPedigreeFunction": diabetes_pedigree_function,
        "Age": age,
    }

    patient = pd.DataFrame([raw_values])[features]

    probability = model.predict_proba(patient)[0][1]
    risk_percentage = probability * 100

    if risk_percentage >= 70:
        risk_level = "High Risk"
    elif risk_percentage >= 40:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    recommendations = get_recommendations(risk_level)

    # ---- SHAP explanation: relative share of influence per feature ----
    # SHAP values from TreeExplainer are in log-odds (margin) space, not
    # probability space, so we report each feature's *share of total
    # influence* on this specific prediction rather than fabricating
    # precise "risk percentage points" from a non-linear transform.
    shap_values = explainer.shap_values(patient)[0]
    total_abs_impact = sum(abs(float(v)) for v in shap_values) or 1.0

    contributions = []
    for feature_name, shap_value in zip(features, shap_values):
        meta = FEATURE_META.get(feature_name, {"label": feature_name, "unit": ""})
        shap_value = float(shap_value)
        contributions.append({
            "feature": feature_name,
            "label": meta["label"],
            "value": round(float(raw_values[feature_name]), 2),
            "unit": meta["unit"],
            "influence_share": round(abs(shap_value) / total_abs_impact * 100, 1),  # % of total influence
            "direction": "increases_risk" if shap_value > 0 else "decreases_risk",
            "range_flag": get_range_flag(feature_name, raw_values[feature_name]),
            "normal_range": get_normal_range_label(feature_name),
        })

    # Sort by influence share, strongest first
    contributions.sort(key=lambda c: c["influence_share"], reverse=True)

    return {
        "risk_percentage": round(float(risk_percentage), 2),
        "risk_level": risk_level,
        "recommendations": recommendations,
        "feature_contributions": contributions,
        "top_factors": [c["label"] for c in contributions[:3] if c["direction"] == "increases_risk"],
    }


# ---------------------------------------------------------
# DIRECT TEST
# ---------------------------------------------------------

if __name__ == "__main__":
    result = predict_diabetes_risk(
        glucose=150,
        blood_pressure=80,
        bmi=32,
        age=45,
        insulin=120,
        pregnancies=2,
        skin_thickness=25,
        diabetes_pedigree_function=0.5,
    )

    print("Diabetes Risk Prediction")
    print("------------------------")
    print(f"Risk Percentage : {result['risk_percentage']}%")
    print(f"Risk Level      : {result['risk_level']}")
    print("Recommendations :")

    for recommendation in result["recommendations"]:
        print(f"- {recommendation}")

    print("\nTop contributing factors:")
    for c in result["feature_contributions"][:5]:
        print(f"- {c['label']}: {c['value']}{c['unit']} ({c['influence_share']}% influence, {c['direction']})")