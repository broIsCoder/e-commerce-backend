const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials
  allowedHeaders: "Content-Type, Authorization", // Specify allowed headers
};

module.exports = corsOptions;
