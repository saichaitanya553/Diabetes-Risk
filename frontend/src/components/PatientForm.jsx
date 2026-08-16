import { useState } from "react";

const initialForm = {
  glucose: "",
  blood_pressure: "",
  bmi: "",
  age: "",
  insulin: "",
};

const limits = {
  glucose: {
    min: 1,
    max: 500,
    label: "Glucose",
  },
  blood_pressure: {
    min: 1,
    max: 250,
    label: "Blood Pressure",
  },
  bmi: {
    min: 1,
    max: 80,
    label: "BMI",
  },
  age: {
    min: 1,
    max: 120,
    label: "Age",
  },
  insulin: {
    min: 0,
    max: 1000,
    label: "Insulin",
  },
};

function PatientForm({ onPredict, loading, onReset }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove previous error while user corrects the value
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    /* =========================
       CHECK EMPTY FIELDS
       ========================= */

    const missingField = Object.entries(form).find(
      ([, value]) => value.trim() === ""
    );

    if (missingField) {
      const fieldName = limits[missingField[0]].label;

      setError(
        `Please enter a value for ${fieldName}.`
      );

      return;
    }

    /* =========================
       CHECK NUMERIC VALUES
       ========================= */

    for (const [field, value] of Object.entries(form)) {

      const numberValue = Number(value);

      const {
        min,
        max,
        label
      } = limits[field];

      if (!Number.isFinite(numberValue)) {

        setError(
          `${label} must be a valid number.`
        );

        return;
      }

      if (
        numberValue < min ||
        numberValue > max
      ) {

        setError(
          `${label} must be between ${min} and ${max}.`
        );

        return;
      }
    }

    /* =========================
       SEND DATA TO BACKEND
       ========================= */

    try {

      await onPredict({

        glucose: Number(form.glucose),

        blood_pressure:
          Number(form.blood_pressure),

        bmi: Number(form.bmi),

        age: Number(form.age),

        insulin: Number(form.insulin),

      });

    } catch (error) {

      setError(
        error.message ||
        "Unable to calculate the prediction."
      );

    }
  };


  /* =========================
     DEMO DATA
     ========================= */

  const handleDemoData = () => {

    const demoData = {

      glucose:
        Math.floor(
          Math.random() * 91
        ) + 90,

      blood_pressure:
        Math.floor(
          Math.random() * 41
        ) + 60,

      bmi:
        Number(
          (
            Math.random() * 17 +
            18
          ).toFixed(1)
        ),

      age:
        Math.floor(
          Math.random() * 51
        ) + 20,

      insulin:
        Math.floor(
          Math.random() * 251
        ) + 50,

    };

    setForm({

      glucose:
        String(demoData.glucose),

      blood_pressure:
        String(demoData.blood_pressure),

      bmi:
        String(demoData.bmi),

      age:
        String(demoData.age),

      insulin:
        String(demoData.insulin),

    });

    setError("");
  };


  /* =========================
     RESET
     ========================= */

  const handleReset = () => {

    setForm(initialForm);

    setError("");

    onReset();

  };


  return (
    <form
      className="patient-form"
      onSubmit={handleSubmit}
    >

      {/* GLUCOSE */}

      <div className="field-group">

        <label htmlFor="glucose">
          Glucose
        </label>

        <span className="field-unit">
          mg/dL
        </span>

        <input
          id="glucose"
          name="glucose"
          type="number"
          min="1"
          max="500"
          step="0.1"
          value={form.glucose}
          onChange={handleChange}
          placeholder="e.g. 150"
        />

      </div>


      {/* BLOOD PRESSURE */}

      <div className="field-group">

        <label htmlFor="blood_pressure">
          Blood Pressure
        </label>

        <span className="field-unit">
          mm Hg
        </span>

        <input
          id="blood_pressure"
          name="blood_pressure"
          type="number"
          min="1"
          max="250"
          step="0.1"
          value={form.blood_pressure}
          onChange={handleChange}
          placeholder="e.g. 80"
        />

      </div>


      {/* BMI */}

      <div className="field-group">

        <label htmlFor="bmi">
          BMI
        </label>

        <span className="field-unit">
          kg/m²
        </span>

        <input
          id="bmi"
          name="bmi"
          type="number"
          min="1"
          max="80"
          step="0.1"
          value={form.bmi}
          onChange={handleChange}
          placeholder="e.g. 25.5"
        />

      </div>


      {/* AGE */}

      <div className="field-group">

        <label htmlFor="age">
          Age
        </label>

        <span className="field-unit">
          years
        </span>

        <input
          id="age"
          name="age"
          type="number"
          min="1"
          max="120"
          step="1"
          value={form.age}
          onChange={handleChange}
          placeholder="e.g. 45"
        />

      </div>


      {/* INSULIN */}

      <div className="field-group field-full">

        <label htmlFor="insulin">
          Insulin
        </label>

        <span className="field-unit">
          μU/mL
        </span>

        <input
          id="insulin"
          name="insulin"
          type="number"
          min="0"
          max="1000"
          step="0.1"
          value={form.insulin}
          onChange={handleChange}
          placeholder="e.g. 120"
        />

      </div>


      {/* ERROR */}

      {error && (
        <div className="form-error">
          ⚠️ {error}
        </div>
      )}


      {/* ACTIONS */}

      <div className="form-actions field-full">

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDemoData}
          disabled={loading}
        >
          Demo Data
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Analyzing..."
            : "Predict Diabetes Risk"}
        </button>

      </div>

    </form>
  );
}

export default PatientForm;