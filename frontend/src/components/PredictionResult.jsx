function PredictionResult({ result }) {

  if (!result) {
    return (
      <div className="result-panel result-empty">

        <div className="result-empty-icon">
          AI
        </div>

        <h3>
          Your prediction will appear here
        </h3>

        <p>
          Enter your health information and submit
          the form to receive your diabetes risk assessment.
        </p>

      </div>
    );
  }


  /* =========================
     RISK RESULT
     ========================= */

  const riskPercentage = Number(
    result.risk_percentage ??
      result.risk_score ??
      result.riskPercent ??
      0
  );

  const riskLevel =
    result.risk_level ??
    result.riskLevel ??
    "Unknown";

  const normalizedLevel = riskLevel
    .toLowerCase()
    .replace(/\s+/g, "-");


  /* =========================
     RISK MESSAGE
     ========================= */

  let message =
    "Your predicted risk has been calculated.";

  if (normalizedLevel === "low-risk") {

    message =
      "Your predicted risk is relatively low. Continue maintaining healthy habits.";

  } else if (normalizedLevel === "moderate-risk") {

    message =
      "Your result suggests that paying closer attention to lifestyle habits may be beneficial.";

  } else if (
    normalizedLevel === "high-risk" ||
    normalizedLevel === "higher-risk"
  ) {

    message =
      "Your result indicates a higher predicted risk. Consider discussing your result with a healthcare professional.";
  }


  const score = Math.min(
    Math.max(riskPercentage, 0),
    100
  );


  /* =========================
     MODEL FEATURE IMPORTANCE
     ========================= */

  const featureImportance = [
    {
      name: "Insulin",
      value: 45.40
    },
    {
      name: "Glucose",
      value: 18.75
    },
    {
      name: "Age",
      value: 13.73
    },
    {
      name: "BMI",
      value: 12.27
    },
    {
      name: "Blood Pressure",
      value: 9.85
    }
  ];


  return (
    <div className="result-panel">

      {/* =========================
          HEADER
          ========================= */}

      <div className="result-header">
        ✓ Prediction complete
      </div>


      {/* =========================
          SCORE
          ========================= */}

      <div className="score-area">

  <div className="score-label">
    Estimated Diabetes Risk
  </div>

  <div className="score">
    {riskPercentage.toFixed(2)}
    <span>%</span>
  </div>

  <div className="risk-level-name">
    {riskLevel}
  </div>

</div>


      {/* =========================
          RISK METER
          ========================= */}

      <div className="risk-meter-section">

        <div className="risk-meter-labels">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>

        <div className="risk-meter">

          <div
            className="risk-marker"
            style={{
              left: `${score}%`
            }}
          />

        </div>

        <div className="risk-meter-value">
          Current score: {riskPercentage.toFixed(2)}%
        </div>

      </div>


      {/* =========================
          RISK MESSAGE
          ========================= */}

      <p className="risk-message">
        {message}
      </p>


      {/* =========================
          MODEL INSIGHTS
          ========================= */}

      <div className="prediction-insights">

        <div className="section-label">
          MODEL INSIGHTS
        </div>

        <h3>
          Factors considered by GlucoSense
        </h3>


        <div className="prediction-feature-list">

          {featureImportance.map((feature) => (

            <div
              className="prediction-feature"
              key={feature.name}
            >

              <div className="prediction-feature-header">

                <span>
                  {feature.name}
                </span>

                <strong>
                  {feature.value.toFixed(2)}%
                </strong>

              </div>

              <div className="prediction-feature-bar">

                <div
                  className="prediction-feature-fill"
                  style={{
                    width: `${feature.value}%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default PredictionResult;