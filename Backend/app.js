const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./routes/index");

const app = express();

// Enable CORS
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
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

// Optional: If you still need bodyParser separately
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    max: 3000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again in an hour!"
});
app.use("/api", limiter);

// Sanitize data against NoSQL injection (avoid `req.query` error)
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// Sanitize against XSS attacks
// app.use(xss());

// Mount Routes
app.use(routes);

module.exports = app;
