from pathlib import Path

import joblib
import pandas as pd


# ---------------------------------------------------------
# MODEL PATH
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "diabetes_model.pkl"


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
# PREDICTION
# ---------------------------------------------------------

def predict_diabetes_risk(
    glucose: float,
    blood_pressure: float,
    bmi: float,
    age: float,
    insulin: float,
) -> dict:

    patient = pd.DataFrame(
        [{
            "Glucose": glucose,
            "BloodPressure": blood_pressure,
            "BMI": bmi,
            "Age": age,
            "Insulin": insulin,
        }]
    )

    patient = patient[features]

    probability = model.predict_proba(patient)[0][1]
    risk_percentage = probability * 100

    if risk_percentage >= 70:
        risk_level = "High Risk"
    elif risk_percentage >= 40:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    recommendations = get_recommendations(risk_level)

    return {
        "risk_percentage": round(float(risk_percentage), 2),
        "risk_level": risk_level,
        "recommendations": recommendations,
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
    )

    print("Diabetes Risk Prediction")
    print("------------------------")
    print(f"Risk Percentage : {result['risk_percentage']}%")
    print(f"Risk Level      : {result['risk_level']}")
    print("Recommendations :")

    for recommendation in result["recommendations"]:
        print(f"- {recommendation}")