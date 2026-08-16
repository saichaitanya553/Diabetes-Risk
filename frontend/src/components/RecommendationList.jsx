// Backend recommendation text varies by risk tier (e.g. "Regular Exercise"
// vs. "Maintain Regular Exercise"), so icons are matched by keyword rather
// than an exact string lookup.
function getRecommendationIcon(text) {
  const normalized = String(text || "").toLowerCase();

  if (normalized.includes("exercise") || normalized.includes("activ")) {
    return "🏃";
  }
  if (
    normalized.includes("sugar") ||
    normalized.includes("carb") ||
    normalized.includes("diet") ||
    normalized.includes("eat")
  ) {
    return "🥗";
  }
  if (normalized.includes("check-up") || normalized.includes("checkup") || normalized.includes("health")) {
    return "🩺";
  }
  return "✅";
}

function RecommendationList({ recommendations = [] }) {
  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="recommendations-section">
      <div className="section-label">NEXT STEPS</div>

      <h2>Recommendations</h2>

      <div className="recommendations-grid">
        {recommendations.map((item, index) => (
          <div className="recommendation-item" key={index}>
            <div className="recommendation-icon">
              {getRecommendationIcon(item)}
            </div>

            <div>
              <h3>{item}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendationList;