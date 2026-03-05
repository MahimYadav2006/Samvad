const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes/index");
const {
    getAllowedOrigins,
    isWildcardOriginEnabled,
    isOriginAllowed,
} = require("./utilities/corsConfig");

const app = express();

const allowedOrigins = getAllowedOrigins();
const allowWildcardOrigin = isWildcardOriginEnabled(allowedOrigins);

// Railway sits behind a reverse proxy; trust the first hop.
app.set("trust proxy", 1);

const corsOptions = {
    origin: (origin, callback) => {
        if (isOriginAllowed(origin, allowedOrigins, allowWildcardOrigin)) {
            callback(null, true);
            return;
        }
        callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
};

app.use(cors(corsOptions));

// Health check endpoint for container orchestration
app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Security Headers
app.use(helmet());

// Logger
app.use(morgan("dev"));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Cookie Parser
app.use(cookieParser());

// Rate Limiting on auth routes
const authLimiter = rateLimit({
    max: 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many authentication attempts, please try again later",
});
app.use("/auth", authLimiter);

// Sanitize data against NoSQL injection
// express-mongo-sanitize() as middleware is incompatible with Express 5
// (req.query is a read-only getter in Express 5), so sanitize manually.
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// Mount Routes
app.use(routes);

// ── Multer / file-upload error handler ──────────────────────────────────
// Must come AFTER routes so that multer fileFilter rejections & size
// limit errors are caught here instead of crashing or returning HTML.
const multer = require("multer");
app.use((err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific error (file too large, too many files, etc.)
    return res.status(400).json({
      status: "fail",
      message: err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.message,
    });
  }
  if (err) {
    // Custom fileFilter errors or other middleware errors
    return res.status(400).json({
      status: "fail",
      message: err.message || "Upload failed",
    });
  }
});

module.exports = app;
