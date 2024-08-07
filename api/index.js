require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const connectDB = require("../config/dbConnection");
const corsOptions = require("../config/corsOptions");
const verifyJwt = require("../middleware/verifyJwt");
const scheduleDelivery = require("../controllers/scheduleDelivery");

connectDB(); // connect to MongoDb

function logger(req, res, next) {
  console.log(req.method, req.url);
  console.log('Headers:', req.headers); // Log headers for debugging
  next();
}

app.use(logger); // console log
app.use(cookieParser());
app.use(cors(corsOptions)); // cross origin policy
app.use(express.static(path.join(__dirname, "public"))); // Serve static assets
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Parse URL-encoded bodies
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies

app.get("/", (req, res) => {res.send("Welcome")});
app.use("/signup", require("../routes/signup"));
app.use("/login", require("../routes/login"));
app.use("/refresh", require("../routes/refresh"));
app.use("/user", verifyJwt, require("../routes/user")); // protected route
app.use("/logout", require("../routes/logout"));
app.use("/products", verifyJwt, require("../routes/api/products")); // protected route
app.use("/employee", verifyJwt, require("../routes/api/employee")); // protected route
app.use(require("../routes/not-found"));

// if connected to mongodb, start server
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDb");
  scheduleDelivery();
  // Start server & listen for incoming HTTP requests at port:3000
  app.listen(port, () => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Server running at http://localhost:${port}`);
    } else {
      console.log(`Server running at the domain`);
    }
  });
});

module.exports = app;
