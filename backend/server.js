require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get("/", (req, res) => {
  res.send("🚀 CV Analyzer Backend Running");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,

      atsScore: 85,
      skillsScore: 82,
      experienceScore: 78,

      strengths: [
        "Strong React Knowledge",
        "Good Problem Solving",
        "Backend Basics",
      ],

      missingKeywords: ["Docker", "AWS", "CI/CD"],

      suggestions: [
        "Add GitHub projects",
        "Improve cloud skills",
        "Add certifications",
      ],

      summary:
        "Good developer profile with strong frontend skills. Adding DevOps and cloud will improve ATS ranking significantly.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running http://localhost:${PORT}`)
);