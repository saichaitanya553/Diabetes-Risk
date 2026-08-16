import { useState } from "react";

function PredictionResult({ result }) {

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

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
     OFFLINE ESTIMATE BADGE
     ========================= */

  const isOffline = Boolean(result.offline);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");

    try {
      // Dynamically imported so the PDF library (and its html2canvas
      // dependency) only load when the user actually requests a report,
      // keeping the initial page load lean.
      const { downloadRiskReport } = await import("../services/reportGenerator");
      downloadRiskReport({ result, isOffline });
    } catch (error) {
      setDownloadError(
        error.message || "Unable to generate the report. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };


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
     (per-prediction, from SHAP — not hardcoded)
     ========================= */

  const featureContributions = result.feature_contributions ?? [];

  const rangeFlagLabel = {
    high: "Above typical range",
    elevated: "Slightly elevated",
    normal: "Within typical range",
  };


  return (
    <div className="result-panel">

      {/* =========================
          HEADER
          ========================= */}

      <div className="result-header">
        ✓ Prediction complete

        <button
          type="button"
          className="download-report-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? "Preparing..." : "⬇ Download Report"}
        </button>
      </div>

      {downloadError && (
        <div className="download-error">
          {downloadError}
        </div>
      )}

      {isOffline && (
        <div className="offline-badge">
          ⚡ Offline estimate — backend unreachable. This uses a simplified
          local calculation, not the trained ML model. Reconnect for a
          full assessment.
        </div>
      )}


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

        <p className="insights-description">
          {isOffline
            ? "Based on a simplified local rule-based estimate — each factor's share of influence in this offline calculation."
            : "Based on SHAP analysis of your specific inputs — each factor's share of influence on this individual prediction."}
        </p>


        <div className="prediction-feature-list">

          {featureContributions.map((feature) => (

            <div
              className="prediction-feature"
              key={feature.feature}
            >

              <div className="prediction-feature-header">

                <span>
                  {feature.label}
                  {feature.value !== undefined && (
                    <span className="prediction-feature-value">
                      {" "}({feature.value}{feature.unit})
                    </span>
                  )}
                </span>

                <strong
                  className={
                    feature.direction === "increases_risk"
                      ? "impact-up"
                      : "impact-down"
                  }
                >
                  {feature.direction === "increases_risk" ? "▲" : "▼"}{" "}
                  {feature.influence_share.toFixed(1)}%
                </strong>

              </div>

              <div className="prediction-feature-bar">

                <div
                  className={
                    feature.direction === "increases_risk"
                      ? "prediction-feature-fill fill-up"
                      : "prediction-feature-fill fill-down"
                  }
                  style={{
                    width: `${feature.influence_share}%`
                  }}
                />

              </div>

              {feature.range_flag && (
                <div className={`range-flag range-flag-${feature.range_flag}`}>
                  {rangeFlagLabel[feature.range_flag]}
                </div>
              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default PredictionResult;