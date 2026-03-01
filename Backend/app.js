const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes/index");

const app = express();

// Enable CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));

// Security Headers
app.use(helmet());

// Logger
app.use(morgan("dev"));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

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

module.exports = app;
