require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cron = require('node-cron');
const port = process.env.PORT || 3000;
const connectDB = require("../config/dbConnection");
const corsOptions = require("../config/corsOptions");
const verifyJwt = require("../middleware/verifyJwt");
const handler = require("./cron");

connectDB(); // connect to MongoDb

function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
}

app.use(logger);
app.use(cookieParser());
app.use(cors(corsOptions)); // cross origin policy
app.use(express.static(path.join(__dirname, "public"))); // Serve static assets
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Parse URL-encoded bodies
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies

app.get("/", (req, res) => {
  res.send("Welcome");
});
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
  
  // vercel will manage cron job while in production
  if(process.env.NODE_ENV === "development"){
  cron.schedule('0 0 * * *', handler);  // Schedule the cron job to run every 24 hours (at midnight)
  }

  if (process.env.NODE_ENV === "development") {
    if (process.env.HOST) {
      app.listen(port, process.env.HOST, () => {
        console.log(`Server running at http://${process.env.HOST}:${port}`);
      });
    } else {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    }
  }else{
    console.log("Server running at the domain`")
  }
});

module.exports = app;
