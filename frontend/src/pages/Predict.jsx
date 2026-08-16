import { useState } from "react";
import PatientForm from "../components/PatientForm";
import PredictionResult from "../components/PredictionResult";
import { predictDiabetesRisk } from "../services/api";

function Predict() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handlePrediction = async (patientData) => {
    setLoading(true);
    setApiError("");
    setResult(null);

    try {
      const response = await predictDiabetesRisk(patientData);
      setResult(response);

      // Save every completed prediction locally in this browser.
      // The timestamp is captured after the API successfully returns.
      const historyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        completedAt: new Date().toISOString(),
        inputs: patientData,
        result: response,
      };

      try {
        const existingHistory = JSON.parse(
          localStorage.getItem("glucosense_prediction_history") || "[]"
        );

        localStorage.setItem(
          "glucosense_prediction_history",
          JSON.stringify([historyEntry, ...existingHistory])
        );
      } catch (storageError) {
        console.error("Unable to save prediction history:", storageError);
      }
    } catch (error) {
      setApiError(
        error.message ||
          "Could not connect to the FastAPI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const riskLevel =
    result?.risk_level ??
    result?.riskLevel ??
    "moderate-risk";

  const normalizedLevel = riskLevel
    .toLowerCase()
    .replace(/\s+/g, "-");

  const lifestyleGuidance = {
    "low-risk": {
      dos: [
        "Stay physically active on a regular basis.",
        "Choose balanced meals with vegetables, whole grains, and fiber-rich foods.",
        "Maintain a healthy body weight.",
        "Keep up with routine health check-ups."
      ],
      donts: [
        "Avoid excessive sugary drinks and highly processed foods.",
        "Do not ignore long-term changes in your health.",
        "Do not treat this prediction as a medical diagnosis."
      ]
    },

    "moderate-risk": {
      dos: [
        "Aim for regular physical activity such as walking or moderate exercise.",
        "Choose vegetables, whole grains, and fiber-rich foods.",
        "Limit sugary drinks and highly processed foods.",
        "Maintain a healthy and sustainable weight.",
        "Consider discussing your risk with a healthcare professional."
      ],
      donts: [
        "Avoid frequent sugary beverages and excessive added sugar.",
        "Do not ignore persistent abnormal health readings.",
        "Do not start or stop medication based only on this prediction.",
        "Do not consider this result a confirmed diagnosis."
      ]
    },

    "high-risk": {
      dos: [
        "Consider appropriate medical follow-up and diabetes testing.",
        "Stay physically active according to your abilities.",
        "Choose balanced meals and reduce highly processed foods.",
        "Monitor your health measurements regularly.",
        "Discuss sustainable lifestyle changes with a healthcare professional."
      ],
      donts: [
        "Do not self-diagnose based only on this application.",
        "Do not start or stop medication without medical advice.",
        "Do not ignore abnormal glucose or other health measurements.",
        "Do not rely on this prediction instead of professional evaluation."
      ]
    }
  };

  const guidance =
    lifestyleGuidance[normalizedLevel] ||
    lifestyleGuidance["moderate-risk"];

  return (
    <div className="predict-page">

      {/* PAGE HEADER */}

      <section className="page-heading">

        <div className="section-label">
          DIABETES RISK ASSESSMENT
        </div>

        <h1>
          Check your diabetes risk
        </h1>

        <p>
          Enter your health measurements below to get a
          machine-learning based risk assessment.
        </p>

      </section>


      {/* ERROR */}

      {apiError && (
        <div className="api-error">

          <strong>
            Backend connection error
          </strong>

          <span>
            {apiError}
          </span>

        </div>
      )}


      {/* TOP SECTION */}

      <section className="prediction-layout">

        {/* PATIENT FORM */}

        <div className="form-card">

          <h2>
            Patient Information
          </h2>

          <PatientForm
            onPredict={handlePrediction}
            loading={loading}
            onReset={() => setResult(null)}
          />

        </div>


        {/* RISK RESULT */}

        <PredictionResult result={result} />

      </section>


      {/* DO'S + DON'TS */}

      {result && (
        <section className="lifestyle-section">

          <div className="section-label">
            PERSONALIZED LIFESTYLE GUIDANCE
          </div>

          <h2>
            What you can do next
          </h2>

          <div className="guidance-grid">

            {/* DO'S */}

            <div className="guidance-card do-card">

              <h3>

                <span className="guidance-title-icon">
                  ✓
                </span>

                DO's — Healthy habits

              </h3>

              <div className="guidance-list">

                {guidance.dos.map((item, index) => (

                  <div
                    className="guidance-item"
                    key={index}
                  >

                    <span className="do-check">
                      ✓
                    </span>

                    <p>
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            </div>


            {/* DON'TS */}

            <div className="guidance-card dont-card">

              <h3>

                <span className="guidance-title-icon">
                  !
                </span>

                DON'Ts — Things to avoid

              </h3>

              <div className="guidance-list">

                {guidance.donts.map((item, index) => (

                  <div
                    className="guidance-item"
                    key={index}
                  >

                    <span className="dont-cross">
                      !
                    </span>

                    <p>
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>
      )}


      {/* RECOMMENDATIONS */}

      {result && (
        <section className="recommendations-section">

          <div className="section-label">
            NEXT STEPS
          </div>

          <h2>
            Recommendations
          </h2>

          <div className="recommendations-grid">

            <div className="recommendation-item">

              <div className="recommendation-icon">
                🏃
              </div>

              <div>

                <h3>
                  Regular Exercise
                </h3>

                <p>
                  Aim for regular moderate physical activity
                  most days of the week.
                </p>

              </div>

            </div>


            <div className="recommendation-item">

              <div className="recommendation-icon">
                🥗
              </div>

              <div>

                <h3>
                  Healthy Eating
                </h3>

                <p>
                  Choose balanced meals with vegetables,
                  whole grains and lean proteins.
                </p>

              </div>

            </div>


            <div className="recommendation-item">

              <div className="recommendation-icon">
                🩺
              </div>

              <div>

                <h3>
                  Routine Check-ups
                </h3>

                <p>
                  Regular health check-ups can support early
                  detection and prevention.
                </p>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* FINAL NOTE */}

      {result && (
        <div className="final-note">

          <strong>
            Important:
          </strong>{" "}

          This tool is for educational and screening support only.
          It is not a medical diagnosis. Please consult a qualified
          healthcare professional for medical advice, testing, or
          treatment decisions.

        </div>
      )}

    </div>
  );
}

export default Predict;