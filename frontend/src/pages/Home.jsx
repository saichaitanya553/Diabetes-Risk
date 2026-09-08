
function Home() {
  return (
    <div className="home-page">

      {/* HERO */}
      <section className="home-hero">

        <div className="home-hero-content">

          <div className="eyebrow">
            AI-POWERED DIABETES SCREENING
          </div>

          <h1>
            Know your diabetes
            <span> risk earlier.</span>
          </h1>

          <p className="hero-description">
            GlucoSense uses AI to estimate diabetes risk
            from a small set of health measurements, powered
            by a trained machine-learning model.
          </p>

          <div className="hero-actions">

            <a
              href="/predict"
              className="btn btn-primary hero-btn"
            >
              Start Prediction
              <span className="arrow">→</span>
            </a>

            <a
              href="#how-it-works"
              className="btn btn-secondary hero-btn"
            >
              How It Works
            </a>

          </div>

          {/* TRUST POINTS */}
          <div className="hero-points">

            <div>
              <span>✓</span>
              Quick assessment
            </div>

            <div>
              <span>✓</span>
              ML-based prediction
            </div>

            <div>
              <span>✓</span>
              Lifestyle guidance
            </div>

          </div>

        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">

          <div className="ai-card">

            <div className="ai-card-top">
              <span className="ai-dot"></span>
              PREDICTION ENGINE
            </div>

            <div className="ai-main">
              <div className="ai-circle">
                <span>🩺</span>
              </div>
            </div>

            <h3>Diabetes Risk Screening</h3>

            <p>
              Analyze health measurements and
              receive an estimated risk score.
            </p>

            <div className="ai-status">
              <span>●</span>
              Ready for assessment
            </div>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-label">
          HOW IT WORKS
        </div>

        <h2>
          Three simple steps.
        </h2>

        <div className="steps-grid">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              +
            </div>

            <h3>
              Enter your information
            </h3>

            <p>
              Provide measurements such as glucose,
              blood pressure, BMI, age and insulin.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🩺
            </div>

            <h3>
              Get your risk assessment
            </h3>

            <p>
              The trained machine-learning model
              analyzes the information and generates
              an estimated risk score.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              ✓
            </div>

            <h3>
              Understand your result
            </h3>

            <p>
              View the risk meter and receive lifestyle
              guidance, recommendations and next steps.
            </p>

          </div>

        </div>

      </section>


      {/* INPUTS */}
      <section className="inputs-section">

        <div className="inputs-content">

          <div>
            <div className="section-label">
              WHAT WE ANALYZE
            </div>

            <h2>
              A small set of health measurements.
            </h2>

            <p>
              The prediction form uses key health
              attributes required by the trained model.
            </p>
          </div>


          <div className="input-tags">

            <span>Glucose</span>

            <span>Blood Pressure</span>

            <span>BMI</span>

            <span>Age</span>

            <span>Insulin</span>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="home-cta">

        <div>

          <div className="section-label">
            READY TO BEGIN?
          </div>

          <h2>
            Check your diabetes risk.
          </h2>

          <p>
            Enter your measurements and explore your
            personalized screening result.
          </p>

        </div>

        <a
          href="/predict"
          className="btn btn-primary"
        >
          Start Assessment →
        </a>

      </section>


      {/* DISCLAIMER */}
      <section className="home-disclaimer">

        <strong>Important:</strong>

        <span>
          GlucoSense is an educational and screening
          support tool. Its result is not a medical diagnosis.
          Please consult a qualified healthcare professional
          for medical advice, testing or treatment decisions.
        </span>

      </section>

    </div>
  );
}

export default Home;