import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { motion } from "framer-motion";
import jsPDF from "jspdf";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* =========================
   ATS RING (CLEAN)
========================= */
const AtsRing = ({ value }) => (
  <motion.div
    className="ring-wrapper"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="ring-box">
      <CircularProgressbar
        value={value}
        text={`${value}%`}
        strokeWidth={8}
        styles={buildStyles({
          pathColor:
            value >= 80 ? "#22c55e" : value >= 50 ? "#facc15" : "#ef4444",
          trailColor: "#1f2937",
          textColor: "#e5e7eb",
        })}
      />
    </div>
    <p className="ring-label">ATS Score</p>
  </motion.div>
);

/* =========================
   SCORE BAR (ANIMATED)
========================= */
const ScoreBar = ({ label, value }) => (
  <div className="score-wrap">
    <div className="score-top">
      <span>{label}</span>
      <span>{value}%</span>
    </div>

    <div className="bar-bg">
      <motion.div
        className="bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  </div>
);

/* =========================
   PDF DOWNLOAD (PRO)
========================= */
const downloadPDF = (result) => {
  const doc = new jsPDF();

  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("AI CV ANALYSIS REPORT", 20, 20);

  doc.setFontSize(12);
  doc.text("================================", 20, 30);

  doc.text(`ATS SCORE: ${result.atsScore}%`, 20, 40);
  doc.text(`SKILLS SCORE: ${result.skillsScore}%`, 20, 50);
  doc.text(`EXPERIENCE: ${result.experienceScore}%`, 20, 60);

  doc.text("================================", 20, 70);

  doc.text("SUMMARY:", 20, 85);
  const summary = doc.splitTextToSize(result.summary, 170);
  doc.text(summary, 20, 95);

  doc.text("STRENGTHS:", 20, 130);
  result.strengths?.forEach((s, i) => {
    doc.text(`- ${s}`, 25, 140 + i * 10);
  });

  doc.text("MISSING SKILLS:", 20, 180);
  result.missingKeywords?.forEach((m, i) => {
    doc.text(`- ${m}`, 25, 190 + i * 10);
  });

  doc.save("CV_REPORT.pdf");
};

/* =========================
   MAIN APP
========================= */
function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select CV PDF");

    const formData = new FormData();
    formData.append("cv", file); 

    setLoading(true);

    try {
      // 🛠️ FIXED: Added your true Railway live URL endpoint
      const API_URL = "https://cv-analyzer-production.up.railway.app/api/analyze";
      
      // Axios POST Request with withCredentials fixed
      const res = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });

      setResult(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Server Error: Cannot connect to Backend. Check Console!");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result && {
    labels: ["ATS", "Skills", "Experience"],
    datasets: [
      {
        label: "Score",
        data: [
          result.atsScore || 0,
          result.skillsScore || 0,
          result.experienceScore || 0,
        ],
        borderRadius: 10,
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      },
    ],
  };

  return (
    <div className="app">

      {/* HERO */}
      <div className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🔥 AI CV Analyzer
        </motion.h1>

        <p>Upload your CV and get ATS insights</p>

        <div className="upload-card">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze 🚀"}
          </button>
        </div>
      </div>

      {/* RESULT */}
      {result && (
        <>
          {/* TOP SECTION */}
          <div className="top">
            <AtsRing value={result.atsScore} />

            <div className="bars">
              <ScoreBar label="Skills" value={result.skillsScore} />
              <ScoreBar label="Experience" value={result.experienceScore} />
            </div>
          </div>

          {/* SCORE ROW */}
          <div className="score-row">
            {[
              { label: "ATS", value: result.atsScore },
              { label: "Skills", value: result.skillsScore },
              { label: "Experience", value: result.experienceScore },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="score-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h2>{item.value}%</h2>
                <p>{item.label}</p>
              </motion.div>
            ))}
          </div>

          {/* DASHBOARD */}
          <div className="dashboard">

            <motion.div className="card">
              <h3>📊 Analytics</h3>
              {chartData && <Bar data={chartData} />}
            </motion.div>

            <motion.div className="card">
              <h3>📝 Summary</h3>
              <p>{result.summary}</p>
            </motion.div>

            <motion.div className="card">
              <h3>✅ Strengths</h3>
              <ul>
                {result.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div className="card">
              <h3>❌ Missing Skills</h3>
              <ul>
                {result.missingKeywords?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </motion.div>

            {/* FULL WIDTH */}
            <motion.div className="card full">
              <h3>💡 Suggestions</h3>

              <ul>
                {result.suggestions?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <button onClick={() => downloadPDF(result)}>
                📄 Download PDF
              </button>
            </motion.div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;