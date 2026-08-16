from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Allow Python to find the src folder
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.ml_predict import predict_diabetes_risk

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
        insulin=data.insulin
    )

    return result