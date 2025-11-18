const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");
const path = require("path");


const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const userRoutes = require("./routes/userRoutes");
const empRoutes = require("./routes/empRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const questionRoutes = require("./routes/questionRoutes");
const entityRoutes = require("./routes/entityRoutes");
const domainRoutes = require("./routes/domainRoutes");
const addReqRoutes = require("./routes/reqRoutes");
const reqRoutes = require("./routes/reqRoutes");
const s3Router = require("./routes/preSignedUrl");
const crediantialRoute = require("./routes/crediantialsRoute");
const restApiData = require("./routes/restApi/getAllRequest");
const currencyData = require("./routes/currencyRoute");
const poData = require("./routes/purchaseOrderRoute");
const smtpRouter = require("./routes/smtpRoutes");
const newKeyData = require("./routes/restApi/ssoRoute");
const { loadSecrets } = require("./utils/secretLoader");

dotenv.config();

async function startServer() {
  try {
    await loadSecrets();
    require("./utils/poExpiryReminderEmail");
    await db();

    const app = express();
    const port = 5005;


    app.use((req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      next();
    });

    app.use(cors());


    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "script-src": [
              "'self'",
              "https://accounts.google.com",
              "https://apis.google.com"
            ],
            "frame-src": [
              "'self'",
              "https://accounts.google.com"
            ],
            "connect-src": ["'self'", "*"],
          },
        },
      })
    );



    app.use(
      rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 200,
      })
    );


    app.use(express.json({ limit: "100mb", strict: false }));
    app.use(bodyParser.json({ limit: "100mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

    app.use(express.static(path.join(__dirname, "dist")));


    app.use("/", userRoutes);
    app.use("/employees", empRoutes);
    app.use("/vendors", vendorRoutes);
    app.use("/questions", questionRoutes);
    app.use("/entity", entityRoutes);
    app.use("/domains", domainRoutes);
    app.use("/users", addReqRoutes);
    app.use("/request", reqRoutes);
    app.use("/upload-s3", s3Router);
    app.use("/credantials", crediantialRoute);
    app.use("/get-restapidata", restApiData);
    app.use("/create-key", newKeyData);
    app.use("/currency", currencyData);
    app.use("/purchase-order", poData);
    app.use("/create-smtp", smtpRouter);


    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });


    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        console.log("❌ Invalid JSON received");
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      next(err);
    });


    app.use((err, req, res, next) => {
      if (err instanceof URIError) {
        console.log("❌ Blocked bad URI:", req.url);
        return res.status(400).send("Bad request");
      }
      next(err);
    });


    app.use((err, req, res, next) => {
      console.error("🔥 Global Server Error:", err);
      res.status(500).json({ message: "Server error" });
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
