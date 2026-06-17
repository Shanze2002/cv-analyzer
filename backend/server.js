require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

const app = express();

// ========================
// 🛠️ CORS Setup (Vercel URL එක මෙතනට ලින්ක් කරලා තියෙන්නේ)
// ========================
app.use(cors({
    origin: 'https://cv-analyzer-orcin.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());

// ========================
// Create uploads folder automatically
// ========================
const uploadDir = "./uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// ========================
// Test Route
// ========================
app.get("/", (req, res) => {
    res.send("🚀 CV Analyzer Backend Running");
});

// ========================
// Multer Setup
// ========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// ========================
// 🚀 Analyze Route (Frontend එකෙන් කතා කරන නිවැරදි Endpoint එක)
// ========================
app.post("/api/analyze", upload.single("cv"), async (req, res) => {

    try {
        console.log("📥 Upload request received");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        console.log("📄 File:", req.file.filename);

        const filePath = path.join(__dirname, req.file.path);
        const dataBuffer = fs.readFileSync(filePath);

        console.log("📖 Reading PDF...");
        const data = await pdf(dataBuffer);

        console.log("✅ PDF parsed successfully");
        console.log("🧾 Characters:", data.text.length);

        // ========================
        // MOCK AI RESULT
        // ========================
        const result = {
            success: true,
            atsScore: 88,
            skillsScore: 84,
            experienceScore: 79,
            strengths: [
                "Strong React Skills",
                "Node.js Knowledge",
                "Good Project Experience",
                "Problem Solving Ability"
            ],
            missingKeywords: [
                "Docker",
                "AWS",
                "CI/CD",
                "Kubernetes"
            ],
            suggestions: [
                "Add GitHub project links",
                "Include certifications",
                "Mention deployment experience",
                "Add measurable achievements"
            ],
            summary: "Strong developer profile with good fundamentals. Adding cloud + DevOps skills will improve ATS ranking."
        };

        res.status(200).json(result);

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});