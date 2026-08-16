import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getLifestyleGuidance } from "../utils/lifestyleGuidance";

const BRAND_COLOR = [20, 108, 90]; // matches --primary green
const HIGH_COLOR = [192, 57, 43];
const MODERATE_COLOR = [169, 102, 11];
const LOW_COLOR = [20, 108, 90];
const GREEN = [22, 130, 90];
const RED = [192, 57, 43];

function getRiskColor(riskLevel) {
  const normalized = (riskLevel || "").toLowerCase();
  if (normalized.includes("high")) return HIGH_COLOR;
  if (normalized.includes("moderate")) return MODERATE_COLOR;
  return LOW_COLOR;
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

// jsPDF's built-in fonts (Helvetica) don't support the full Unicode
// glyph set — characters like µ (micro) and ² (superscript two) render
// as garbage. Substitute PDF-safe equivalents purely for this report.
function pdfSafe(text) {
  if (text === undefined || text === null) return text;
  return String(text)
    .replace(/\u03bc/g, "u") // μ -> u  (e.g. "μU/mL" -> "uU/mL")
    .replace(/\u00b2/g, "2") // ² -> 2  (e.g. "kg/m²" -> "kg/m2")
    .replace(/\u00b0/g, "deg");
}

/**
 * Builds a PDF report covering:
 *  - the model's risk prediction
 *  - each factor's individual value and clinical range status
 *    (NOT compared against dataset/population averages)
 *  - top contributing factors and short-form recommendations
 *  - personalized lifestyle Do's & Don'ts for the predicted risk level
 */
export function generateRiskReport({ result, isOffline }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  function ensureSpace(needed, y) {
    if (y + needed > pageHeight - 56) {
      doc.addPage();
      return 56;
    }
    return y;
  }

  // ---- Header ----
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("GlucoSense — Diabetes Risk Report", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated ${formatDate(new Date())}`, margin, 50);

  let cursorY = 95;

  if (isOffline) {
    doc.setFillColor(253, 241, 220);
    doc.rect(margin, cursorY, pageWidth - margin * 2, 28, "F");
    doc.setTextColor(138, 90, 8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Offline estimate — generated using a simplified local calculation,",
      margin + 8,
      cursorY + 12
    );
    doc.text(
      "not the trained ML model. Reconnect and re-run for a full assessment.",
      margin + 8,
      cursorY + 22
    );
    cursorY += 40;
  }

  // ---- Risk summary ----
  const riskColor = getRiskColor(result.risk_level);
  doc.setTextColor(...riskColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(`${Number(result.risk_percentage).toFixed(2)}%`, margin, cursorY + 30);

  doc.setFontSize(13);
  doc.text(pdfSafe(result.risk_level) || "Unknown", margin, cursorY + 50);

  doc.setTextColor(90, 100, 97);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Estimated diabetes risk", margin, cursorY + 66);

  cursorY += 90;

  // ---- Your levels table (no dataset/population averages) ----
  doc.setTextColor(20, 30, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Your Health Measurements", margin, cursorY);
  cursorY += 8;

  const rows = (result.feature_contributions ?? []).map((c) => {
    const unit = c.unit ? ` ${pdfSafe(c.unit)}` : "";
    return [
      c.label,
      `${c.value}${unit}`,
      c.normal_range ? pdfSafe(c.normal_range) : "—",
      c.range_flag
        ? c.range_flag.charAt(0).toUpperCase() + c.range_flag.slice(1)
        : c.direction === "increases_risk"
        ? "Contributing"
        : "—",
    ];
  });

  autoTable(doc, {
    startY: cursorY + 6,
    margin: { left: margin, right: margin },
    head: [["Factor", "Your Value", "Normal Range", "Status"]],
    body: rows,
    headStyles: { fillColor: BRAND_COLOR, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [40, 50, 47] },
    alternateRowStyles: { fillColor: [245, 248, 247] },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 3) {
        const val = String(data.cell.raw).toLowerCase();
        if (val === "high" || val === "contributing") {
          data.cell.styles.textColor = HIGH_COLOR;
          data.cell.styles.fontStyle = "bold";
        } else if (val === "elevated") {
          data.cell.styles.textColor = MODERATE_COLOR;
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  let afterTableY = doc.lastAutoTable.finalY + 20;

  // ---- Top contributing factors ----
  if (result.top_factors?.length) {
    afterTableY = ensureSpace(60, afterTableY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 30, 28);
    doc.text("Top Contributing Factors", margin, afterTableY);
    afterTableY += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 70, 67);
    result.top_factors.forEach((factor, i) => {
      afterTableY = ensureSpace(15, afterTableY);
      doc.text(`${i + 1}. ${pdfSafe(factor)}`, margin + 8, afterTableY);
      afterTableY += 15;
    });
    afterTableY += 6;
  }

  // ---- Recommendations (short-form, from the model/offline estimator) ----
  if (result.recommendations?.length) {
    afterTableY = ensureSpace(60, afterTableY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 30, 28);
    doc.text("Recommendations", margin, afterTableY);
    afterTableY += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 70, 67);
    result.recommendations.forEach((rec) => {
      afterTableY = ensureSpace(15, afterTableY);
      doc.text(`•  ${pdfSafe(rec)}`, margin + 8, afterTableY);
      afterTableY += 15;
    });
    afterTableY += 6;
  }

  // ---- Personalized lifestyle Do's & Don'ts ----
  const guidance = getLifestyleGuidance(result.risk_level);

  function bulletSection(title, items, color, mark) {
    afterTableY = ensureSpace(30, afterTableY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 30, 28);
    doc.text(title, margin, afterTableY);
    afterTableY += 16;

    items.forEach((item) => {
      const size = 10;
      const lineGap = 4;
      const textLines = doc.splitTextToSize(item, contentWidth - 18);
      const blockHeight = textLines.length * (size + lineGap) + 2;
      afterTableY = ensureSpace(blockHeight, afterTableY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.text(mark, margin, afterTableY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 70, 67);
      textLines.forEach((line, idx) => {
        doc.text(line, margin + 16, afterTableY + idx * (size + lineGap));
      });

      afterTableY += textLines.length * (size + lineGap) + 4;
    });

    afterTableY += 6;
  }

  if (guidance?.dos?.length) {
    // jsPDF's built-in Helvetica font doesn't support the ✓ glyph (same
    // issue pdfSafe() works around above), so use a plain "+" marker here.
    bulletSection("Do's — Healthy Habits", guidance.dos, GREEN, "+");
  }

  if (guidance?.donts?.length) {
    bulletSection("Don'ts — Things to Avoid", guidance.donts, RED, "!");
  }

  // ---- Disclaimer ----
  afterTableY = ensureSpace(70, afterTableY);
  const disclaimerY = afterTableY + 10;

  doc.setDrawColor(220, 231, 227);
  doc.line(margin, disclaimerY - 10, pageWidth - margin, disclaimerY - 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 67);
  doc.text("Important:", margin, disclaimerY + 5);

  doc.setFont("helvetica", "normal");
  const disclaimerText =
    "This report is generated by an educational screening tool and is not a medical diagnosis. " +
    "It should not replace professional medical advice, testing, or treatment. Please consult a " +
    "qualified healthcare professional to discuss these results.";
  const wrapped = doc.splitTextToSize(disclaimerText, pageWidth - margin * 2);
  doc.text(wrapped, margin, disclaimerY + 18);

  return doc;
}

export function downloadRiskReport(args) {
  const doc = generateRiskReport(args);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`glucosense-risk-report-${stamp}.pdf`);
}
