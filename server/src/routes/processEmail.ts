/**
 * /process-email endpoint - Handles form data and analyzes attached PDFs
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import { analyzePdfDocument } from "../services/documentIntelligence";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDFs only
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

/**
 * POST /process-email
 * Receives form data with email details and PDF attachments
 * Analyzes PDFs using Azure Document Intelligence
 */
router.post("/", upload.array("attachments", 10), async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { from, subject, body } = req.body;
    const files = req.files as Express.Multer.File[];

    console.log("\n📧 Processing email request");
    console.log(`   From: ${from}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Attachments: ${files?.length || 0}`);

    // Validate required fields
    if (!from || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Missing required fields: from, subject, body",
          code: "MISSING_FIELDS",
        },
      });
    }

    // Analyze PDFs if attachments exist
    const pdfAnalysisResults = [];
    
    if (files && files.length > 0) {
      console.log(`\n📄 Analyzing ${files.length} PDF(s)...`);

      for (const file of files) {
        try {
          console.log(`   Processing: ${file.originalname}`);

          // Convert buffer to base64
          const pdfBase64 = file.buffer.toString("base64");

          // Analyze with Azure Document Intelligence
          const { rawResponse, orderDetails } = await analyzePdfDocument(pdfBase64);

          pdfAnalysisResults.push({
            fileName: file.originalname,
            fileSize: file.size,
            success: true,
            orderDetails,
            confidence: orderDetails.confidence.overall,
          });

          console.log(`   ✅ ${file.originalname} - Confidence: ${(orderDetails.confidence.overall * 100).toFixed(1)}%`);
        } catch (error: any) {
          console.error(`   ❌ ${file.originalname} - Error: ${error.message}`);
          
          pdfAnalysisResults.push({
            fileName: file.originalname,
            fileSize: file.size,
            success: false,
            error: error.message,
          });
        }
      }
    }

    const processingTime = Date.now() - startTime;

    // Prepare response
    const response = {
      success: true,
      data: {
        emailData: {
          from,
          subject,
          body,
          attachmentsCount: files?.length || 0,
        },
        pdfAnalysis: pdfAnalysisResults,
        summary: {
          totalPDFs: files?.length || 0,
          successfulAnalyses: pdfAnalysisResults.filter((r) => r.success).length,
          failedAnalyses: pdfAnalysisResults.filter((r) => !r.success).length,
          averageConfidence:
            pdfAnalysisResults.length > 0
              ? pdfAnalysisResults
                  .filter((r) => r.success)
                  .reduce((sum, r) => sum + (r.confidence || 0), 0) /
                pdfAnalysisResults.filter((r) => r.success).length
              : 0,
        },
        processingTime,
      },
    };

    console.log(`\n✅ Email processed in ${processingTime}ms`);
    console.log(`   Success rate: ${response.data.summary.successfulAnalyses}/${response.data.summary.totalPDFs}`);

    res.json(response);
  } catch (error: any) {
    console.error("\n❌ Error processing email:", error);

    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Internal server error",
        code: "PROCESSING_ERROR",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
});

/**
 * GET /process-email/health
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Process email endpoint is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
