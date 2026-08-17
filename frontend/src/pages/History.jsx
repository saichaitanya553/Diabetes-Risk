import { useState } from "react";

const HISTORY_KEY = "glucosense_prediction_history";

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Unable to read prediction history:", error);
    return [];
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getRisk(entry) {
  const result = entry.result || {};
  const percentage = Number(
    result.risk_percentage ?? result.risk_score ?? result.riskPercent ?? 0
  );
  const level = result.risk_level ?? result.riskLevel ?? "Unknown";
  return { percentage, level };
}

function History() {
  const [history, setHistory] = useState(readHistory);

  const clearHistory = () => {
    if (!history.length) return;
    if (!window.confirm("Clear all prediction history from this browser?")) return;
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const deleteEntry = (id) => {
    const updated = history.filter((entry) => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (entry) => {
    setDownloadingId(entry.id);
    try {
      const { downloadRiskReport } = await import("../services/reportGenerator");
      downloadRiskReport({
        result: entry.result,
        isOffline: Boolean(entry.result?.offline),
      });
    } catch (error) {
      console.error("Unable to generate PDF report:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="history-page">
      <section className="page-heading history-heading">
        <div>
          <div className="section-label">PREDICTION HISTORY</div>
          <h1>Recent diabetes risk predictions</h1>
          <p>
            Your completed predictions are stored only in this browser using local storage.
          </p>
        </div>

        {history.length > 0 && (
          <button className="btn btn-secondary history-clear" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </section>

      {history.length === 0 ? (
        <section className="history-empty">
          <div className="history-empty-icon">↺</div>
          <h2>No predictions yet</h2>
          <p>
            Complete a prediction from the Predict Risk page and it will appear here automatically.
          </p>
          <a className="btn btn-primary" href="/predict">Make a prediction</a>
        </section>
      ) : (
        <section className="history-list" aria-label="Prediction history">
          {history.map((entry) => {
            const { percentage, level } = getRisk(entry);
            const inputs = entry.inputs || {};
            const normalizedLevel = level.toLowerCase().replace(/\s+/g, "-");

            return (
              <article className="history-card" key={entry.id}>
                <div className="history-card-top">
                  <div>
                    <div className="history-completed">✓ Prediction completed</div>
                    <time dateTime={entry.completedAt}>{formatDateTime(entry.completedAt)}</time>
                  </div>
                  <div className={`history-risk ${normalizedLevel}`}>
                    <strong>{Number.isFinite(percentage) ? percentage.toFixed(2) : "0.00"}%</strong>
                    <span>{level}</span>
                  </div>
                </div>

                <div className="history-inputs">
                  <div><span>Glucose</span><strong>{inputs.glucose ?? "—"} mg/dL</strong></div>
                  <div><span>Blood Pressure</span><strong>{inputs.blood_pressure ?? "—"}</strong></div>
                  <div><span>BMI</span><strong>{inputs.bmi ?? "—"}</strong></div>
                  <div><span>Age</span><strong>{inputs.age ?? "—"}</strong></div>
                  <div><span>Insulin</span><strong>{inputs.insulin ?? "—"}</strong></div>
                  {inputs.pregnancies !== undefined && (
                    <div><span>Pregnancies</span><strong>{inputs.pregnancies}</strong></div>
                  )}
                  {inputs.skin_thickness !== undefined && (
                    <div><span>Skin Thickness</span><strong>{inputs.skin_thickness}</strong></div>
                  )}
                  {inputs.diabetes_pedigree_function !== undefined && (
                    <div><span>Family History</span><strong>{inputs.diabetes_pedigree_function}</strong></div>
                  )}
                </div>

                <button
                  type="button"
                  className="history-download"
                  onClick={() => handleDownload(entry)}
                  disabled={downloadingId === entry.id}
                  aria-label="Download PDF report"
                  title="Download PDF report"
                >
                  {downloadingId === entry.id ? (
                    <span className="history-download-spinner" aria-hidden="true" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  )}
                </button>

                <button className="history-delete" onClick={() => deleteEntry(entry.id)}>
                  Remove
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default History;
