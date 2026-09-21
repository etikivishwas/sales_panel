const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const salesRoutes = require("./routes/salesRoutes");
const profileRoutes = require("./routes/profileRoutes");
const salesVendorRegistrationRoutes = require("./routes/salesVendorRegistrationRoutes");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Favicon route
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// Authentication routes
app.use("/api/sales/auth", authRoutes);

// Sales routes
app.use("/api/sales", salesRoutes);

app.use("/api/sales/profile", profileRoutes);

app.use("/vendor-registration", salesVendorRegistrationRoutes);

// 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

module.exports = app;
