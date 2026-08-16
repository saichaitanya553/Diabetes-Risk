/**
 * Personalized lifestyle Do's & Don'ts, keyed by normalized risk level
 * ("low-risk" | "moderate-risk" | "high-risk").
 *
 * Shared between the on-screen guidance card (Predict.jsx) and the
 * downloadable PDF report (reportGenerator.js) so the two never drift
 * out of sync.
 */
const LIFESTYLE_GUIDANCE = {
  "low-risk": {
    dos: [
      "Stay physically active on a regular basis.",
      "Choose balanced meals with vegetables, whole grains, and fiber-rich foods.",
      "Maintain a healthy body weight.",
      "Keep up with routine health check-ups.",
    ],
    donts: [
      "Avoid excessive sugary drinks and highly processed foods.",
      "Do not ignore long-term changes in your health.",
      "Do not treat this prediction as a medical diagnosis.",
    ],
  },

  "moderate-risk": {
    dos: [
      "Aim for regular physical activity such as walking or moderate exercise.",
      "Choose vegetables, whole grains, and fiber-rich foods.",
      "Limit sugary drinks and highly processed foods.",
      "Maintain a healthy and sustainable weight.",
      "Consider discussing your risk with a healthcare professional.",
    ],
    donts: [
      "Avoid frequent sugary beverages and excessive added sugar.",
      "Do not ignore persistent abnormal health readings.",
      "Do not start or stop medication based only on this prediction.",
      "Do not consider this result a confirmed diagnosis.",
    ],
  },

  "high-risk": {
    dos: [
      "Consider appropriate medical follow-up and diabetes testing.",
      "Stay physically active according to your abilities.",
      "Choose balanced meals and reduce highly processed foods.",
      "Monitor your health measurements regularly.",
      "Discuss sustainable lifestyle changes with a healthcare professional.",
    ],
    donts: [
      "Do not self-diagnose based only on this application.",
      "Do not start or stop medication without medical advice.",
      "Do not ignore abnormal glucose or other health measurements.",
      "Do not rely on this prediction instead of professional evaluation.",
    ],
  },
};

/**
 * Returns { dos, donts } for a given risk level string (e.g. "High Risk",
 * "moderate-risk", "Higher Risk"). Falls back to moderate-risk guidance
 * for unrecognized levels.
 */
export function getLifestyleGuidance(riskLevel) {
  const normalized = String(riskLevel || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace("higher-risk", "high-risk");

  return LIFESTYLE_GUIDANCE[normalized] || LIFESTYLE_GUIDANCE["moderate-risk"];
}
