import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "react-circular-progressbar/dist/styles.css";
import "./App.css";

/* =========================
   ATS RING
========================= */
const AtsRing = ({ value }) => (
  <motion.div
    className="ring-wrapper"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
  >
    <CircularProgressbar
      value={value}
      text={`${value}%`}
      strokeWidth={8}
      styles={buildStyles({
        pathColor:
          value >= 80
            ? "#22c55e"
            : value >= 50
            ? "#facc15"
            : "#ef4444",
        trailColor: "#1f2937",
        textColor: "#e5e7eb",
      })}
    />
    <p className="ring-label">ATS Score</p>
  </motion.div>
);

/* =========================
   PDF DOWNLOAD
========================= */
const downloadPDF = (result) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AI CV ANALYSIS REPORT", 20, 20);

  doc.setFontSize(12);
  doc.text(`ATS Score: ${result.atsScore}%`, 20, 40);
  doc.text(`Skills Score: ${result.skillsScore}%`, 20, 50);
  doc.text(`Experience Score: ${result.experienceScore}%`, 20, 60);

  doc.text("Summary:", 20, 80);

  const lines = doc.splitTextToSize(result.summary, 170);
  doc.text(lines, 20, 90);

  doc.save("CV_REPORT.pdf");
};

/* =========================
   APP
========================= */
function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stage, setStage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF CV");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setStage("uploading");

    try {
      setTimeout(() => setStage("reading"), 700);
      setTimeout(() => setStage("extracting"), 1400);
      setTimeout(() => setStage("analyzing"), 2100);
      setTimeout(() => setStage("finalizing"), 2800);

      const res = await axios.post(
        "http://localhost:5000/api/analyze",
        formData
      );

      setTimeout(() => {
        setResult(res.data);
        setLoading(false);
        setStage("done");
      }, 3200);
    } catch (err) {
      alert("Backend connection error");
      setLoading(false);
      setStage("");
    }
  };

  /* GRAPH DATA */
  const chartData = result
    ? [
        { name: "ATS", value: result.atsScore },
        { name: "Skills", value: result.skillsScore },
        { name: "Experience", value: result.experienceScore },
      ]
    : [];

  return (
    <div className="app">

      {/* HERO */}
      <div className="hero">

        <motion.div className="hero-badge">
          ⚡ AI CV ANALYZER
        </motion.div>

        <h1>Upgrade Your CV Instantly</h1>

        <p>
          ATS score, skill gaps, AI suggestions & career insights
        </p>

        <div className="upload-wrapper">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze CV"}
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="ai-loader">
            <div className="spinner"></div>
            <h3>
              {stage === "uploading" && "Uploading CV..."}
              {stage === "reading" && "Reading CV..."}
              {stage === "extracting" && "Extracting Skills..."}
              {stage === "analyzing" && "AI Analyzing..."}
              {stage === "finalizing" && "Generating Report..."}
            </h3>
            <p>AI is processing your resume</p>
          </div>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <motion.div
          className="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* ATS */}
          <div className="result-hero">
            <AtsRing value={result.atsScore} />

            <div className="mini-stats">
              <div>Skills: {result.skillsScore}%</div>
              <div>Experience: {result.experienceScore}%</div>
            </div>
          </div>

          {/* GRID */}
          <div className="grid">

            {/* GRAPH */}
            <div className="card chart-card">
              <h3>📊 CV Performance Graph</h3>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3>🧠 AI Summary</h3>
              <p>{result.summary}</p>
            </div>

            <div className="card">
              <h3>💪 Strengths</h3>
              <ul>
                {result.strengths?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="card danger">
              <h3>⚠ Missing Skills</h3>
              <ul>
                {result.missingKeywords?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>🚀 Suggestions</h3>
              <ul>
                {result.suggestions?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

          </div>

          <button className="pdf-btn" onClick={() => downloadPDF(result)}>
            Download Full Report
          </button>

        </motion.div>
      )}

    </div>
  );
}

export default App;