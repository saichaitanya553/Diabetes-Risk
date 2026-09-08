import { jsPDF } from "jspdf";

/**
 * Generates and downloads a PDF diabetes risk report.
 *
 * Sections included:
 *  - Header / branding
 *  - Patient inputs
 *  - Risk score + risk level
 *  - Model insights (feature importance)
 *  - Personalized lifestyle Do's & Don'ts
 *  - Medical disclaimer
 *
 * Intentionally excluded:
 *  - Any "dataset average" / population comparison section
 */
export function generateReportPdf({ inputs, result, guidance, featureImportance }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  let y = 56;

  const colors = {
    primary: [37, 99, 235], // blue
    dark: [17, 24, 39],
    muted: [107, 114, 128],
    green: [22, 163, 74],
    red: [220, 38, 38],
    line: [229, 231, 235],
  };

  const riskPercentage = Number(
    result?.risk_percentage ?? result?.risk_score ?? result?.riskPercent ?? 0
  );
  const riskLevel = result?.risk_level ?? result?.riskLevel ?? "Unknown";
  const normalizedLevel = String(riskLevel).toLowerCase().replace(/\s+/g, "-");

  const riskColor =
    normalizedLevel === "low-risk"
      ? colors.green
      : normalizedLevel === "high-risk" || normalizedLevel === "higher-risk"
      ? colors.red
      : [217, 119, 6]; // amber for moderate

  function ensureSpace(needed) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 56) {
      doc.addPage();
      y = 56;
    }
  }

  function sectionLabel(text) {
    ensureSpace(24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.primary);
    doc.text(text.toUpperCase(), marginX, y);
    y += 6;
    doc.setDrawColor(...colors.line);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 18;
  }

  function heading(text, size = 14) {
    ensureSpace(size + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...colors.dark);
    doc.text(text, marginX, y);
    y += size + 8;
  }

  function bodyText(text, options = {}) {
    const { size = 10.5, color = colors.dark, lineGap = 5 } = options;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      ensureSpace(size + lineGap);
      doc.text(line, marginX, y);
      y += size + lineGap;
    });
  }

  function bulletList(items, { markColor, mark }) {
    items.forEach((item) => {
      const size = 10;
      const lineGap = 4;
      const textLines = doc.splitTextToSize(item, contentWidth - 18);
      const blockHeight = textLines.length * (size + lineGap) + 4;
      ensureSpace(blockHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...markColor);
      doc.text(mark, marginX, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.dark);
      textLines.forEach((line, idx) => {
        doc.text(line, marginX + 16, y + idx * (size + lineGap));
      });

      y += textLines.length * (size + lineGap) + 6;
    });
  }

  // ===================== HEADER =====================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...colors.primary);
  doc.text("GlucoSense", marginX, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...colors.muted);
  doc.text("Diabetes Risk Assessment Report", marginX, y);
  y += 14;

  const generatedOn = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  doc.setFontSize(9);
  doc.text(`Generated on ${generatedOn}`, marginX, y);
  y += 22;

  doc.setDrawColor(...colors.line);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 28;

  // ===================== PATIENT INPUTS =====================
  if (inputs) {
    sectionLabel("Patient Information");

    const rows = [
      ["Glucose", inputs.glucose != null ? `${inputs.glucose} mg/dL` : "—"],
      ["Blood Pressure", inputs.blood_pressure != null ? `${inputs.blood_pressure} mm Hg` : "—"],
      ["BMI", inputs.bmi ?? "—"],
      ["Age", inputs.age != null ? `${inputs.age} years` : "—"],
      ["Insulin", inputs.insulin != null ? `${inputs.insulin} mu U/ml` : "—"],
    ];

    const colWidth = contentWidth / 2;
    rows.forEach((row, idx) => {
      const rowY = y + Math.floor(idx / 2) * 20;
      const colX = marginX + (idx % 2) * colWidth;
      ensureSpace(24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.muted);
      doc.text(`${row[0]}:`, colX, rowY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.dark);
      doc.text(String(row[1]), colX + 90, rowY);
    });
    y += Math.ceil(rows.length / 2) * 20 + 18;
  }

  // ===================== RISK SCORE =====================
  sectionLabel("Risk Assessment Result");

  ensureSpace(70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...riskColor);
  doc.text(`${riskPercentage.toFixed(2)}%`, marginX, y + 28);

  doc.setFontSize(13);
  doc.text(String(riskLevel), marginX + 150, y + 22);
  y += 46;

  let message = "Your predicted risk has been calculated.";
  if (normalizedLevel === "low-risk") {
    message = "Your predicted risk is relatively low. Continue maintaining healthy habits.";
  } else if (normalizedLevel === "moderate-risk") {
    message = "Your result suggests that paying closer attention to lifestyle habits may be beneficial.";
  } else if (normalizedLevel === "high-risk" || normalizedLevel === "higher-risk") {
    message = "Your result indicates a higher predicted risk. Consider discussing your result with a healthcare professional.";
  }
  bodyText(message, { color: colors.muted });
  y += 12;

  // ===================== MODEL INSIGHTS =====================
  if (Array.isArray(featureImportance) && featureImportance.length) {
    sectionLabel("Model Insights — Factors Considered");

    featureImportance.forEach((feature) => {
      ensureSpace(26);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(feature.name, marginX, y);
      doc.setFont("helvetica", "bold");
      doc.text(`${feature.value.toFixed(2)}%`, pageWidth - marginX - 40, y);

      // bar
      const barY = y + 5;
      const barMaxWidth = contentWidth;
      doc.setFillColor(229, 231, 235);
      doc.rect(marginX, barY, barMaxWidth, 5, "F");
      doc.setFillColor(...colors.primary);
      doc.rect(marginX, barY, (barMaxWidth * Math.min(feature.value, 100)) / 100, 5, "F");

      y += 24;
    });
    y += 10;
  }

  // ===================== LIFESTYLE DO'S & DON'TS =====================
  if (guidance) {
    sectionLabel("Personalized Lifestyle Guidance");

    heading("Do's — Healthy Habits", 12);
    bulletList(guidance.dos || [], { markColor: colors.green, mark: "✓" });
    y += 6;

    heading("Don'ts — Things to Avoid", 12);
    bulletList(guidance.donts || [], { markColor: colors.red, mark: "!" });
    y += 10;
  }

  // ===================== DISCLAIMER =====================
  sectionLabel("Important Disclaimer");
  bodyText(
    "This tool is for educational and screening support only. It is not a medical diagnosis. " +
      "Please consult a qualified healthcare professional for medical advice, testing, or treatment decisions.",
    { color: colors.muted, size: 9.5 }
  );

  const fileNameLevel = normalizedLevel || "report";
  doc.save(`GlucoSense-Risk-Report-${fileNameLevel}-${Date.now()}.pdf`);
}
