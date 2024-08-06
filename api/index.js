require("dotenv").config();
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 3000;
const connectDB = require("../config/dbConnection");
const corsOption = require("../config/corsOption");
const verifyJwt = require("../middleware/verifyJwt"); 
const scheduleDelivery = require("../controllers/scheduleDelivery");

connectDB(); // connect to MongoDb

function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
}

app.use(logger); // console log
app.use(cookieParser());
app.use(cors(corsOption)); // cross origin policy
app.use(express.static(path.join(__dirname, "public"))); // Serve static assets (static assests => e.g : CSS & images)
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Parse URL-encoded bodies ( form data => e.g : name=John&age=30&city=New+York)
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies ( stringified json => e.g : {"name":"Johhn","age":"30","city":"New York"})

app.get("/", (req, res) => {
  res.send("welcome");
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
  scheduleDelivery();
  // Starts server & listen for incoming HTTP requests at port:3500
  if (process.env.NODE_ENV === "development") {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }else{
    console.log(`Server running at the domain`);
  }
});

module.exports = app;
