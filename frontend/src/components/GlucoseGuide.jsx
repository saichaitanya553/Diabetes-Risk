import { useState } from "react";

function classifyPreBreakfast(value) {
  if (value < 100) {
    return {
      risk: "Low Risk",
      tone: "good",
      label: "Typical range",
      detail: "Below 100 mg/dL",
      score: 1,
    };
  }

  if (value < 126) {
    return {
      risk: "Moderate Risk",
      tone: "caution",
      label: "Prediabetes range",
      detail: "100–125 mg/dL",
      score: 2,
    };
  }

  return {
    risk: "High Risk",
    tone: "alert",
    label: "Diabetes range",
    detail: "126 mg/dL or higher",
    score: 3,
  };
}

function classifyPostLunch(value) {
  if (value < 140) {
    return {
      risk: "Low Risk",
      tone: "good",
      label: "Typical range",
      detail: "Below 140 mg/dL",
      score: 1,
    };
  }

  if (value < 200) {
    return {
      risk: "Moderate Risk",
      tone: "caution",
      label: "Elevated range",
      detail: "140–199 mg/dL",
      score: 2,
    };
  }

  return {
    risk: "High Risk",
    tone: "alert",
    label: "Diabetes range",
    detail: "200 mg/dL or higher",
    score: 3,
  };
}

function classifyA1c(value) {
  if (value < 5.7) {
    return {
      risk: "Low Risk",
      tone: "good",
      label: "Typical range",
      detail: "Below 5.7%",
      score: 1,
    };
  }

  if (value < 6.5) {
    return {
      risk: "Moderate Risk",
      tone: "caution",
      label: "Prediabetes range",
      detail: "5.7–6.4%",
      score: 2,
    };
  }

  return {
    risk: "High Risk",
    tone: "alert",
    label: "Diabetes range",
    detail: "6.5% or higher",
    score: 3,
  };
}

function getFoodSuggestions(preBreakfast, postLunch, a1c, overallScore) {
  const suggestions = [
    "Fill about half your plate with non-starchy vegetables such as leafy greens, cucumber, cauliflower, beans or mixed vegetables.",
    "Include a protein source such as dal, beans, eggs, fish, chicken, paneer or tofu with meals.",
    "Prefer high-fiber carbohydrate portions such as oats, whole-wheat roti, brown rice or other minimally processed whole grains.",
    "Choose water or unsweetened drinks instead of sugary drinks, sweetened juices and soft drinks.",
  ];

  if (overallScore >= 2) {
    suggestions.push(
      "Keep portions of rice, roti, noodles and other refined or starchy foods moderate, and avoid frequent sweets and sugary snacks."
    );
  }

  if (overallScore === 3) {
    suggestions.push(
      "Because at least one reading is in the high-risk range, prioritize balanced meals and arrange appropriate medical follow-up rather than relying on food changes alone."
    );
  }

  if (postLunch - preBreakfast >= 40) {
    suggestions.push(
      "Your post-lunch reading is noticeably higher than your pre-breakfast reading. Try a lunch with more vegetables and protein and a smaller refined-carbohydrate portion."
    );
  }

  if (a1c >= 5.7) {
    suggestions.push(
      "For a higher HbA1c result, choose fiber-rich foods more often and limit added sugars and highly processed foods."
    );
  }

  return suggestions;
}

function GlucoseGuide() {
  const [preBreakfast, setPreBreakfast] = useState("");
  const [postLunch, setPostLunch] = useState("");
  const [a1cValue, setA1cValue] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const handleAssess = (event) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    const pre = Number(preBreakfast);
    const post = Number(postLunch);
    const a1c = Number(a1cValue);

    if (
      !Number.isFinite(pre) ||
      !Number.isFinite(post) ||
      !Number.isFinite(a1c) ||
      pre <= 0 ||
      post <= 0 ||
      a1c <= 0
    ) {
      setError("Please enter valid values for all three measurements.");
      return;
    }

    if (pre > 600 || post > 600 || a1c > 20) {
      setError("Please enter values within the supported ranges.");
      return;
    }

    const fasting = classifyPreBreakfast(pre);
    const afterMeal = classifyPostLunch(post);
    const hbA1c = classifyA1c(a1c);
    const overallScore = Math.max(
      fasting.score,
      afterMeal.score,
      hbA1c.score
    );

    const overall =
      overallScore === 1
        ? {
            risk: "Low Risk",
            tone: "good",
            message:
              "All three readings are within the lower screening ranges.",
          }
        : overallScore === 2
          ? {
              risk: "Moderate Risk",
              tone: "caution",
              message:
                "At least one reading is in an elevated or prediabetes range. Pay attention to food choices, activity and follow-up testing.",
            }
          : {
              risk: "High Risk",
              tone: "alert",
              message:
                "At least one reading is in a high-risk range. Arrange appropriate medical evaluation and confirmation rather than relying on this screening result alone.",
            };

    setAnalysis({
      pre,
      post,
      a1c,
      fasting,
      afterMeal,
      hbA1c,
      overall,
      rise: post - pre,
      food: getFoodSuggestions(pre, post, a1c, overallScore),
    });
  };

  const handleReset = () => {
    setPreBreakfast("");
    setPostLunch("");
    setA1cValue("");
    setAnalysis(null);
    setError("");
  };

  return (
    <section className="glucose-guide-section">
      <div className="section-label">GLUCOSE & HbA1c RISK ASSESSMENT</div>

      <h2>Check your glucose readings and risk level.</h2>

      <p className="glucose-guide-intro">
        Enter your pre-breakfast glucose, 2-hour post-lunch glucose and
        laboratory HbA1c value to receive separate Low, Moderate or High Risk
        results and practical food suggestions.
      </p>

      <div className="glucose-guide-grid">
        <div className="glucose-guide-card">
          <form onSubmit={handleAssess}>
            <div className="glucose-input-grid">
              <div className="glucose-field">
                <label htmlFor="pre-breakfast">Pre-breakfast glucose</label>
                <span>mg/dL</span>
                <input
                  id="pre-breakfast"
                  type="number"
                  min="1"
                  max="600"
                  step="0.1"
                  value={preBreakfast}
                  onChange={(e) => setPreBreakfast(e.target.value)}
                  placeholder="e.g. 95"
                />
                <small>
                  Fasting reading after at least 8 hours without calories.
                </small>
              </div>

              <div className="glucose-field">
                <label htmlFor="post-lunch">2-hour post-lunch glucose</label>
                <span>mg/dL</span>
                <input
                  id="post-lunch"
                  type="number"
                  min="1"
                  max="600"
                  step="0.1"
                  value={postLunch}
                  onChange={(e) => setPostLunch(e.target.value)}
                  placeholder="e.g. 135"
                />
                <small>
                  Measure about 2 hours after starting lunch.
                </small>
              </div>
            </div>

            <div className="glucose-field glucose-a1c-field">
              <label htmlFor="hba1c">HbA1c</label>
              <span>%</span>
              <input
                id="hba1c"
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={a1cValue}
                onChange={(e) => setA1cValue(e.target.value)}
                placeholder="e.g. 5.6"
              />
              <small>
                Enter the HbA1c value from a laboratory report. HbA1c reflects
                longer-term glucose exposure and is not calculated from these
                two daily readings.
              </small>
            </div>

            {error && <div className="glucose-form-error">{error}</div>}

            <div className="glucose-assessment-actions">
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary">
                Assess Glucose Risk
              </button>
            </div>
          </form>

          {analysis && (
            <>
              <div className="glucose-overall">
                <div>
                  <span>OVERALL GLUCOSE RISK</span>
                  <strong>{analysis.overall.risk}</strong>
                </div>
                <p>{analysis.overall.message}</p>
              </div>

              <div className="glucose-results">
                <div className={`glucose-result ${analysis.fasting.tone}`}>
                  <span>Pre-breakfast risk</span>
                  <strong>{analysis.fasting.risk}</strong>
                  <small>
                    {analysis.pre} mg/dL · {analysis.fasting.label}
                  </small>
                </div>

                <div className={`glucose-result ${analysis.afterMeal.tone}`}>
                  <span>Post-lunch risk</span>
                  <strong>{analysis.afterMeal.risk}</strong>
                  <small>
                    {analysis.post} mg/dL · {analysis.afterMeal.label}
                  </small>
                </div>

                <div className={`glucose-result ${analysis.hbA1c.tone}`}>
                  <span>HbA1c risk</span>
                  <strong>{analysis.hbA1c.risk}</strong>
                  <small>
                    {analysis.a1c.toFixed(1)}% · {analysis.hbA1c.label}
                  </small>
                </div>

                <div className="glucose-result neutral">
                  <span>Reading change</span>
                  <strong>
                    {analysis.rise >= 0 ? "+" : ""}
                    {analysis.rise.toFixed(1)} mg/dL
                  </strong>
                  <small>Post-lunch minus pre-breakfast</small>
                </div>
              </div>

              <div className="food-suggestions">
                <div className="section-label">FOOD SUGGESTIONS</div>
                <h3>What you can choose for meals</h3>

                <div className="food-suggestion-list">
                  {analysis.food.map((item, index) => (
                    <div className="food-suggestion-item" key={index}>
                      <span>✓</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="glucose-reference-card">
          <div className="section-label">QUICK REFERENCE</div>
          <h3>Risk levels for screening</h3>

          <div className="reference-row">
            <span>Pre-breakfast glucose</span>
            <strong>&lt;100 mg/dL → Low Risk</strong>
            <small>Typical fasting screening range</small>
          </div>

          <div className="reference-row">
            <span>Pre-breakfast glucose</span>
            <strong>100–125 mg/dL → Moderate Risk</strong>
            <small>Prediabetes range</small>
          </div>

          <div className="reference-row">
            <span>Pre-breakfast glucose</span>
            <strong>≥126 mg/dL → High Risk</strong>
            <small>Diabetes diagnostic threshold</small>
          </div>

          <div className="reference-row">
            <span>2-hour post-lunch glucose</span>
            <strong>&lt;140 mg/dL → Low Risk</strong>
            <small>Typical 2-hour screening range</small>
          </div>

          <div className="reference-row">
            <span>2-hour post-lunch glucose</span>
            <strong>140–199 mg/dL → Moderate Risk</strong>
            <small>Elevated range</small>
          </div>

          <div className="reference-row">
            <span>2-hour post-lunch glucose</span>
            <strong>≥200 mg/dL → High Risk</strong>
            <small>Diabetes threshold for the appropriate 2-hour test</small>
          </div>

          <div className="reference-row">
            <span>HbA1c</span>
            <strong>&lt;5.7% → Low Risk</strong>
            <small>Typical range</small>
          </div>

          <div className="reference-row">
            <span>HbA1c</span>
            <strong>5.7–6.4% → Moderate Risk</strong>
            <small>Prediabetes range</small>
          </div>

          <div className="reference-row">
            <span>HbA1c</span>
            <strong>≥6.5% → High Risk</strong>
            <small>Diabetes threshold</small>
          </div>

          <p className="glucose-reference-note">
            The thresholds above follow the American Diabetes Association
            2026 screening/diagnostic criteria. The post-lunch home reading is
            used here as a screening indicator; it is not the same test as a
            laboratory 75-g oral glucose tolerance test.
          </p>

          <p className="glucose-disclaimer">
            This page provides screening support, not a diagnosis. Abnormal
            results should be confirmed with appropriate clinical testing.
          </p>
        </div>
      </div>
    </section>
  );
}

export default GlucoseGuide;
