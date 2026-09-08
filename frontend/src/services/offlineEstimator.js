/**
 * Offline fallback risk estimator.
 *
 * This is NOT the trained XGBoost model — it's a simplified, transparent
 * rule-based scorer built from established clinical risk thresholds
 * (ADA/WHO prediabetes and diabetes cutoffs). It exists purely so the
 * app stays usable if the FastAPI backend is unreachable (e.g. during a
 * live demo with a flaky connection). Every result from this path is
 * clearly labeled `offline: true` and should never be presented to the
 * user as equivalent to the real model's output.
 */

// Mirrors the backend's CLINICAL_RANGES (src/ml_predict.py) so the
// downloadable report shows the same reference ranges whether the
// prediction came from the live model or this offline fallback.
const NORMAL_RANGES = {
  Glucose: "70-99 mg/dL",
  BloodPressure: "60-80 mm Hg",
  BMI: "18.5-24.9 kg/m\u00b2",
  Insulin: "16-166 \u03bcU/mL",
};

function scoreGlucose(value) {
  if (value < 100) return 0;
  if (value <= 125) return 15; // prediabetic range
  if (value <= 140) return 30;
  return 40; // clearly diabetic range
}

function scoreBmi(value) {
  if (value < 25) return 0;
  if (value < 30) return 10; // overweight
  return 20; // obese
}

function scoreAge(value) {
  if (value < 30) return 0;
  if (value < 45) return 5;
  if (value < 60) return 10;
  return 15;
}

function scoreBloodPressure(value) {
  if (value < 80) return 0;
  if (value < 90) return 5; // elevated
  return 10; // hypertensive range
}

function scoreInsulin(value) {
  if (value <= 166) return 0; // typical range
  return 10;
}

export function estimateRiskOffline(patientData) {
  const factors = [
    {
      feature: "Glucose",
      label: "Glucose",
      value: patientData.glucose,
      unit: "mg/dL",
      score: scoreGlucose(patientData.glucose),
    },
    {
      feature: "BMI",
      label: "BMI",
      value: patientData.bmi,
      unit: "kg/m\u00b2",
      score: scoreBmi(patientData.bmi),
    },
    {
      feature: "Age",
      label: "Age",
      value: patientData.age,
      unit: "years",
      score: scoreAge(patientData.age),
    },
    {
      feature: "BloodPressure",
      label: "Blood Pressure",
      value: patientData.blood_pressure,
      unit: "mm Hg",
      score: scoreBloodPressure(patientData.blood_pressure),
    },
    {
      feature: "Insulin",
      label: "Insulin",
      value: patientData.insulin,
      unit: "\u03bcU/mL",
      score: scoreInsulin(patientData.insulin),
    },
  ];

  const rawTotal = factors.reduce((sum, f) => sum + f.score, 0);
  // Max attainable score across all factors, used to scale into 0-100
  const maxPossible = 40 + 20 + 15 + 10 + 10; // 95
  const riskPercentage = Math.min(100, Math.round((rawTotal / maxPossible) * 100 * 1.15 * 100) / 100);

  let riskLevel = "Low Risk";
  if (riskPercentage >= 70) riskLevel = "High Risk";
  else if (riskPercentage >= 40) riskLevel = "Moderate Risk";

  const recommendations =
    riskLevel === "High Risk"
      ? ["Regular Exercise", "Sugar Control", "Quarterly Health Check-up"]
      : riskLevel === "Moderate Risk"
      ? ["Regular Exercise", "Reduce Sugar and Refined Carbohydrates", "Quarterly Health Check-up"]
      : ["Maintain Regular Exercise", "Maintain Healthy Sugar Intake", "Routine Health Check-up"];

  const totalScore = rawTotal || 1;
  const feature_contributions = factors
    .map((f) => ({
      feature: f.feature,
      label: f.label,
      value: typeof f.value === "number" ? Math.round(f.value * 100) / 100 : f.value,
      unit: f.unit,
      influence_share: Math.round((f.score / totalScore) * 1000) / 10,
      direction: f.score > 0 ? "increases_risk" : "decreases_risk",
      range_flag: null,
      normal_range: NORMAL_RANGES[f.feature] ?? null,
    }))
    .sort((a, b) => b.influence_share - a.influence_share);

  return {
    risk_percentage: riskPercentage,
    risk_level: riskLevel,
    recommendations,
    feature_contributions,
    top_factors: feature_contributions
      .filter((f) => f.direction === "increases_risk")
      .slice(0, 3)
      .map((f) => f.label),
    offline: true,
  };
}
