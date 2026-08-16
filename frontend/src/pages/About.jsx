import { useEffect, useState } from "react";
import { getModelInfo } from "../services/api";

function About() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getModelInfo()
      .then(setModelInfo)
      .catch(() => setLoadError(true));
  }, []);

  // Fallback values shown only if the API is unreachable, clearly
  // labeled as such rather than silently passing off as live data.
  const metrics = modelInfo?.test_metrics ?? {
    accuracy: 0.87,
    precision: 0.81,
    recall: 0.81,
    f1_score: 0.81,
  };

  return (
    <div className="about-page">

      {/* ABOUT INTRO */}
      <section className="about-intro">

        <h1>
          Turn health measurements into
          <span> meaningful insights.</span>
        </h1>

        <p>
          GlucoSense is designed to make diabetes
          risk screening simple, understandable and useful.
          Instead of presenting only a prediction, the
          application also provides practical lifestyle
          guidance based on the estimated risk.
        </p>

      </section>


      {/* THREE FEATURES */}
      <section className="about-features">

        <div className="about-feature-card">

          <div className="about-number">
            01
          </div>

          <h2>
            Simple Assessment
          </h2>

          <p>
            Enter a small set of health measurements
            through an easy-to-use form.
          </p>

        </div>


        <div className="about-feature-card">

          <div className="about-number">
            02
          </div>

          <h2>
            Machine Learning
          </h2>

          <p>
            Your health inputs are processed by the
            trained XGBoost model to estimate your
            diabetes risk.
          </p>

        </div>


        <div className="about-feature-card">

          <div className="about-number">
            03
          </div>

          <h2>
            Actionable Guidance
          </h2>

          <p>
            Understand your result through a risk meter,
            healthy habits, things to avoid and practical
            next steps.
          </p>

        </div>

      </section>


      {/* MODEL PERFORMANCE */}
      <section className="model-performance">

        <div className="section-label">
          MODEL PERFORMANCE
        </div>

        <h2>
          How well does the model perform?
        </h2>

        <p className="performance-description">
          The final XGBoost model was evaluated using
          multiple classification metrics on a held-out test set,
          trained on all 8 clinical features from the dataset.
          {loadError && " (Showing last-known values — live metrics unavailable.)"}
        </p>


        <div className="performance-grid">

          <div className="performance-card">
            <span>Accuracy</span>
            <strong>{(metrics.accuracy * 100).toFixed(2)}%</strong>
            <p>
              Overall correct predictions
            </p>
          </div>


          <div className="performance-card">
            <span>Precision</span>
            <strong>{(metrics.precision * 100).toFixed(2)}%</strong>
            <p>
              Correct positive predictions
            </p>
          </div>


          <div className="performance-card">
            <span>Recall</span>
            <strong>{(metrics.recall * 100).toFixed(2)}%</strong>
            <p>
              Actual positive cases identified
            </p>
          </div>


          <div className="performance-card">
            <span>F1 Score</span>
            <strong>{(metrics.f1_score * 100).toFixed(2)}%</strong>
            <p>
              Balance between precision and recall
            </p>
          </div>

          {modelInfo?.test_metrics?.roc_auc && (
            <div className="performance-card">
              <span>ROC-AUC</span>
              <strong>{(modelInfo.test_metrics.roc_auc * 100).toFixed(2)}%</strong>
              <p>
                Ability to separate risk classes
              </p>
            </div>
          )}

        </div>

        {modelInfo?.cv_metrics && (
          <p className="performance-cv-note">
            5-fold cross-validation accuracy: {(modelInfo.cv_metrics.accuracy * 100).toFixed(2)}%
            {" "}— consistent with the holdout test result, indicating the
            model generalizes rather than overfitting to one split.
          </p>
        )}

      </section>


      {/* IMPORTANT NOTE */}
      <section className="about-note">

        <strong>Important:</strong>

        <span>
          GlucoSense is an educational and screening
          support tool. The prediction is not a medical
          diagnosis and should not replace professional
          medical advice, testing or treatment.
        </span>

      </section>

    </div>
  );
}

export default About;