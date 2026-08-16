function RecommendationList({ recommendations = [] }) {
  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="recommendation-card">
      <div className="section-label">NEXT STEPS</div>

      <h2>Recommendations</h2>

      <div className="recommendation-list">
        {recommendations.map((item, index) => (
          <div className="recommendation-item" key={index}>
            <span className="recommendation-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendationList;