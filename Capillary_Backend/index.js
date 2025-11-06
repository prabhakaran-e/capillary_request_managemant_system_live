const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const db = require("./config/db");
const cors = require("cors");
const path = require("path");
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
    // 1️⃣ Load secrets before anything else
   await loadSecrets();
  
    require("./utils/poExpiryReminderEmail")
  


    // 2️⃣ Connect to DB
    await db();

    // 3️⃣ Setup Express app
    const app = express();
    const port = process.env.PORT || 5005;

    app.use((req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      next();
    });

    app.use(cors());
    app.use(bodyParser.json({ limit: "100mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
    app.use(express.static(path.join(__dirname, "dist")));

    // Routes
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

    // Catch-all route
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
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
