const API_URL = import.meta.env.VITE_API_URL;

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
    // The backend is unreachable (server down, no network, CORS block,
    // etc). Surface this clearly rather than silently substituting a
    // different, non-ML estimate the user didn't ask for.
    throw new Error(
      "Could not connect to the prediction server. Please check your connection and try again."
    );
  }

  const data = await response.json();

  if (!response.ok) {
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