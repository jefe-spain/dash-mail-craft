/**
 * /analyze endpoint - PDF order analysis
 */

import { Router, Request, Response } from "express";
import { analyzePdfDocument, isValidBase64 } from "../services/documentIntelligence";
import { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from "../types";

const router = Router();

/**
 * POST /analyze
 * Analyzes a PDF document sent as base64 string
 */
router.post("/", async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const { pdfBase64, fileName }: AnalyzeRequest = req.body;

    if (!pdfBase64) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          message: "Missing pdfBase64 in request body",
          code: "MISSING_PDF",
        },
      };
      return res.status(400).json(errorResponse);
    }

    // Validate base64 format
    if (!isValidBase64(pdfBase64)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          message: "Invalid base64 format",
          code: "INVALID_BASE64",
        },
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`📄 Processing PDF: ${fileName || "unnamed"}`);

    // Analyze document with Azure Document Intelligence
    const { rawResponse, orderDetails } = await analyzePdfDocument(pdfBase64);

    const processingTime = Date.now() - startTime;

    // Prepare response
    const response: AnalyzeResponse = {
      success: true,
      data: {
        orderDetails,
        rawAzureResponse: rawResponse,
        processingTime,
      },
    };

    console.log(`✅ Analysis complete in ${processingTime}ms`);
    console.log(`📊 Confidence: ${(orderDetails.confidence.overall * 100).toFixed(1)}%`);
    console.log(`📦 Line items found: ${orderDetails.lineItems.length}`);

    res.json(response);
  } catch (error: any) {
    console.error("❌ Error in /analyze:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message: error.message || "Internal server error",
        code: "PROCESSING_ERROR",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };

    res.status(500).json(errorResponse);
  }
});

/**
 * GET /analyze/health
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Analyze endpoint is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
