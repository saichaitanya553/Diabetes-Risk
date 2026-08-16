const API_URL = import.meta.env.VITE_API_URL;

import { estimateRiskOffline } from "./offlineEstimator";

export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend is unavailable.");
  }

  return response.json();
}

export async function predictDiabetesRisk(patientData) {
  let response;

  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });
  } catch {
    // The backend is unreachable (server down, no network, CORS block, etc).
    // Fall back to a transparent, clearly-labeled offline estimate rather
    // than leaving the user with nothing — important for live demos.
    return estimateRiskOffline(patientData);
  }

  const data = await response.json();

  if (!response.ok) {
    // The backend responded but rejected the request (e.g. validation
    // error) — this is a real error, not a connectivity problem, so it
    // should surface to the user rather than being silently masked by
    // the offline fallback.
    throw new Error(data.detail || "Prediction failed.");
  }

  return data;
}

export async function getModelInfo() {
  const response = await fetch(`${API_URL}/model-info`);

  if (!response.ok) {
    throw new Error("Unable to load model info.");
  }

  return response.json();
}