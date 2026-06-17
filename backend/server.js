require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");

const app = express();

// ========================
// 🛠️ CORS Setup - Express 5 Compatible
// ========================
const allowedOrigins = [
    'https://cv-analyzer-dkas2o4ex-shanze.vercel.app', 
    'https://cv-analyzer-orcin.vercel.app',           
    'http://localhost:3000'                           
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, // ✅ OPTIONS request ආවම කෙලින්ම CORS middleware එකෙන්ම response එක යවනවා
    optionsSuccessStatus: 204  // ✅ පරණ බ්‍රවුසර් වලටත් සපෝට් කරන්න 204 status එක දෙනවා
}));

// ❌ app.options('*') හෝ app.options('(.*)') මෙතන ඕනෙම නැහැ! ක්‍රෑෂ් වෙන ලෙඩේ මුලින්ම ඉවරයි.

app.use(express.json());

// ========================
// Create uploads folder automatically
// ========================
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ========================
// Test Route
// ========================
app.get("/", (req, res) => {
    res.send("🚀 CV Analyzer Backend Running Successfully on Railway!");
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
// 🚀 Analyze Route
// ========================
app.post("/api/analyze", upload.single("file"), async (req, res) => {

    try {
        console.log("📥 Upload request received");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        console.log("📄 File saved to:", req.file.path);

        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);

        console.log("📖 Reading PDF...");
        const data = await pdf(dataBuffer);

        console.log("✅ PDF parsed successfully");
        console.log("🧾 Characters:", data.text.length);

        try {
            fs.unlinkSync(filePath);
            console.log("🗑️ Temporary file deleted from server");
        } catch (err) {
            console.error("⚠️ Failed to delete temporary file:", err.message);
        }

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
// වෙනස් කරන්න:
const PORT = process.env.PORT || 8080; // Railway වලට 8080 සාමාන්‍යයි
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});