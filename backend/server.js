import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import getSequelize from "./config/database.js";
import { createSessionConfig } from "./config/sessionConfig.js";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import "./models/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV,
  });
});

app.use((err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDatabase(maxRetries = 10) {
  const sequelize = getSequelize();

  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`Connecting to MySQL... Attempt ${i}`);

      await sequelize.authenticate();

      console.log("✅ MySQL Connected");

      await sequelize.sync();

      console.log("✅ Tables Synced");

      return sequelize;
    } catch (err) {
      console.error(`Attempt ${i} Failed`);

      console.error(err.message);

      if (i === maxRetries) {
        throw err;
      }

      await sleep(5000);
    }
  }
}

async function startServer() {
  try {
    await connectDatabase();

    const sessionMiddleware = await createSessionConfig();

    app.use(sessionMiddleware);

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (err) {
    console.error("Server Startup Failed");

    console.error(err);

    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection");

  console.error(err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception");

  console.error(err);

  process.exit(1);
});

startServer();