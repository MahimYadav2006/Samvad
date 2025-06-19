const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("cookie-session");

const routes = require("./routes/index");

const app = express();

app.use(
    cors({
        origin: "*", // Allow all domains to access the server
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all methods
        credentials: true, // Allow credentials
    })
)

app.use(cookieParser());
app.use(express.json({limit: "10kb"})); // Used to parse the json data with max size limit of 10kb

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
app.use(morgan("dev"));

const limiter = rateLimit({
    max:3000,
    windowMs: 60 * 60 * 1000, // At max 3000 request per hour
    message: "Too many requests from this IP, please try again in an hour!"
});

app.use("/api", limiter);
app.use(express.urlencoded({extended: true}));
app.use(mongoSanitize()); // To sanitize the data from mongoDB
app.use(xss()); // To sanitize the data from XSS attacks

// ToDO Add Routes Now

app.use(routes);
module.exports = app;