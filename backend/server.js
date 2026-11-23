import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import path from "path";
import authRouter from "./routes/authRouter.js";
import invoiceRouter from "./routes/invoiceRouter.js";
import businessProfileRouter from "./routes/businessProfileRouter.js";
import aiInvoiceRouter from "./routes/aiInvoiceRouter.js";

const app = express();
const port = process.env.PORT || 4000;

// CORS - Comprehensive configuration for Local, Vercel, Devtunnels, and Custom Domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      // Exact match from allowed list
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow any Vercel deployment (preview or production)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

      // Allow devtunnels
      if (/^https:\/\/.*\.devtunnels\.ms$/.test(origin)) return callback(null, true);

      // Fallback: allow origin
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Ensure DB connection on each serverless invocation
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error in request:", err);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// ROUTE
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/invoices", invoiceRouter); // plural
app.use("/api/businessProfile", businessProfileRouter);
app.use("/api/ai", aiInvoiceRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start local listener only when not running inside Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
  });
}

export default app;
