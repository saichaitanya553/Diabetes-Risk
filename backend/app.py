from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
import os

# Allow Python to find the src folder
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.ml_predict import predict_diabetes_risk, get_model_metrics

app = FastAPI(
    title="Diabetes Risk Prediction API",
    description="API for predicting diabetes risk using an XGBoost ML model",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientData(BaseModel):
    glucose: float
    blood_pressure: float
    bmi: float
    age: float
    insulin: float
    pregnancies: float = Field(default=0, description="Number of pregnancies (0 if not applicable)")
    skin_thickness: float = Field(default=20, description="Triceps skin fold thickness (mm)")
    diabetes_pedigree_function: float = Field(
        default=0.3, description="Family history / genetic risk score (typically 0.08-2.5)"
    )


@app.get("/")
def home():
    return {
        "message": "Diabetes Risk Prediction API is running!"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "message": "Diabetes Risk Prediction API is running"
    }


@app.post("/predict")
def predict(data: PatientData):

    result = predict_diabetes_risk(
        glucose=data.glucose,
        blood_pressure=data.blood_pressure,
        bmi=data.bmi,
        age=data.age,
        insulin=data.insulin,
        pregnancies=data.pregnancies,
        skin_thickness=data.skin_thickness,
        diabetes_pedigree_function=data.diabetes_pedigree_function,
    )

    return result


@app.get("/model-info")
def model_info():
    """Returns model performance metrics and methodology for the About page."""
    return get_model_metrics()