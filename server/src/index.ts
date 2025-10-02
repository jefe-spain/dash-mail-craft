/**
 * Express Server for PDF Order Analysis
 * Uses Azure Document Intelligence with prebuilt-invoice model
 */

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze";
import processEmailRouter from "./routes/processEmail";
import { initializeClient } from "./services/documentIntelligence";

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
];

// Initialize Express app
const app: Application = express();

// ========== MIDDLEWARE ==========

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" })); // Support larger PDFs
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Dash Mail Craft - PDF Order Analysis Server",
    version: "1.0.0",
    endpoints: {
      analyze: "POST /analyze - Analyze PDF documents (JSON with base64)",
      processEmail: "POST /process-email - Process email with PDF attachments (FormData)",
      health: "GET /health - Server health check",
    },
  });
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// Analyze endpoint
app.use("/analyze", analyzeRouter);

// Process email endpoint
app.use("/process-email", processEmailRouter);

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Endpoint not found",
      code: "NOT_FOUND",
      path: req.path,
    },
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Global error handler:", err);

  res.status(500).json({
    success: false,
    error: {
      message: err.message || "Internal server error",
      code: "INTERNAL_ERROR",
      details: NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

// ========== SERVER INITIALIZATION ==========

function startServer() {
  try {
    // Validate required environment variables
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (!endpoint || !apiKey) {
      console.error("❌ Missing required environment variables:");
      console.error("   - AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT");
      console.error("   - AZURE_DOCUMENT_INTELLIGENCE_KEY");
      console.error("\n📝 Please configure your .env file");
      process.exit(1);
    }

    // Initialize Azure Document Intelligence client
    initializeClient(endpoint, apiKey);

    // Start server
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 Dash Mail Craft - PDF Order Analysis Server");
      console.log("=".repeat(60));
      console.log(`📡 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔒 CORS enabled for: ${ALLOWED_ORIGINS.join(", ")}`);
      console.log(`📄 Azure Document Intelligence: Connected`);
      console.log(`🤖 Model: prebuilt-invoice`);
      console.log("=".repeat(60) + "\n");
      console.log("📋 Available endpoints:");
      console.log(`   GET  /          - Server info`);
      console.log(`   GET  /health    - Health check`);
      console.log(`   POST /analyze   - Analyze PDF documents`);
      console.log("\n✨ Server ready to accept requests!\n");
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down server gracefully...");
  process.exit(0);
});
