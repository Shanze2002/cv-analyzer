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
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* =========================
   ATS RING
========================= */
const AtsRing = ({ value }) => (
  <motion.div className="ring-wrapper" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
    <div className="ring-box">
      <CircularProgressbar
        value={value}
        text={`${value}%`}
        strokeWidth={8}
        styles={buildStyles({
          pathColor: value >= 80 ? "#22c55e" : value >= 50 ? "#facc15" : "#ef4444",
          trailColor: "#1f2937",
          textColor: "#e5e7eb",
        })}
      />
    </div>
    <p className="ring-label">ATS Score</p>
  </motion.div>
);

/* =========================
   SCORE BAR
========================= */
const ScoreBar = ({ label, value }) => (
  <div className="score-wrap">
    <div className="score-top">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="bar-bg">
      <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
    </div>
  </div>
);

/* =========================
   PDF DOWNLOAD
========================= */
const downloadPDF = (result) => {
  const doc = new jsPDF();
  doc.text("AI CV ANALYSIS REPORT", 20, 20);
  doc.text(`ATS SCORE: ${result.atsScore}%`, 20, 40);
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
    formData.append("file", file); 

    setLoading(true);

    try {
      const API_URL = "https://cv-analyzer-production-3d03.up.railway.app/api/analyze";
      
      // ✅ මෙතන withCredentials: true එක අනිවාර්යයි
      // මේ කොටස මෙහෙම වෙනස් කරන්න
    const res = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // withCredentials: true  <-- මේක temporarily comment out කරන්න
});

      setResult(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
      alert("Server Error: Cannot connect to Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="hero">
        <h1>🔥 AI CV Analyzer</h1>
        <div className="upload-card">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze 🚀"}
          </button>
        </div>
      </div>
      {result && (
        <div className="dashboard">
          <AtsRing value={result.atsScore} />
          <button onClick={() => downloadPDF(result)}>📄 Download PDF</button>
        </div>
      )}
    </div>
  );
}

export default App;