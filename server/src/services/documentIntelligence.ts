/**
 * Azure Document Intelligence Service
 * Handles PDF analysis using prebuilt-invoice model
 */

import {
  DocumentAnalysisClient,
  AzureKeyCredential,
  AnalyzeResult,
} from "@azure/ai-form-recognizer";
import { OrderDetails } from "../types";

// Initialize Azure client
let client: DocumentAnalysisClient | null = null;

/**
 * Initialize Azure Document Intelligence client
 */
export function initializeClient(endpoint: string, apiKey: string): void {
  if (!endpoint || !apiKey) {
    throw new Error("Azure Document Intelligence endpoint and API key are required");
  }

  client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  console.log("✅ Azure Document Intelligence client initialized");
}

/**
 * Get the initialized client
 */
function getClient(): DocumentAnalysisClient {
  if (!client) {
    throw new Error("Azure Document Intelligence client not initialized");
  }
  return client;
}

/**
 * Analyze PDF document using Azure Document Intelligence
 * @param pdfBase64 - Base64 encoded PDF string
 * @returns Raw Azure response and structured order details
 */
export async function analyzePdfDocument(pdfBase64: string): Promise<{
  rawResponse: AnalyzeResult;
  orderDetails: OrderDetails;
}> {
  const startTime = Date.now();

  try {
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Analyze document with prebuilt-invoice model
    const poller = await getClient().beginAnalyzeDocument(
      "prebuilt-invoice",
      pdfBuffer
    );

    console.log("⏳ Analyzing document with prebuilt-invoice model...");
    const result = await poller.pollUntilDone();

    const processingTime = Date.now() - startTime;
    console.log(`✅ Document analyzed in ${processingTime}ms`);

    // Extract structured order details
    const orderDetails = extractOrderDetails(result);

    return {
      rawResponse: result,
      orderDetails,
    };
  } catch (error: any) {
    console.error("❌ Error analyzing document:", error);
    throw new Error(`Azure Document Intelligence error: ${error.message}`);
  }
}

/**
 * Extract structured order details from Azure result
 */
function extractOrderDetails(result: AnalyzeResult): OrderDetails {
  const orderDetails: OrderDetails = {
    customer: {},
    lineItems: [],
    confidence: {
      overall: 0,
      customerInfo: 0,
      lineItems: 0,
      totals: 0,
    },
  };

  // Get the first document
  const document = result.documents?.[0];

  if (!document) {
    console.warn("⚠️ No structured document found in result");
    return orderDetails;
  }

  const fields = document.fields;
  const confidenceScores: number[] = [];
  const customerConfidenceScores: number[] = [];
  const totalsConfidenceScores: number[] = [];

  // ========== CUSTOMER INFORMATION ==========
  if (fields?.CustomerName) {
    orderDetails.customer.name = fields.CustomerName.content;
    customerConfidenceScores.push(fields.CustomerName.confidence || 0);
  }

  if (fields?.CustomerAddress) {
    orderDetails.customer.address = fields.CustomerAddress.content;
    customerConfidenceScores.push(fields.CustomerAddress.confidence || 0);
  }

  if (fields?.CustomerAddressRecipient) {
    orderDetails.customer.name =
      orderDetails.customer.name || fields.CustomerAddressRecipient.content;
  }

  // ========== VENDOR INFORMATION ==========
  if (fields?.VendorName) {
    orderDetails.vendor = {
      name: fields.VendorName.content,
    };
    if (fields?.VendorAddress) {
      orderDetails.vendor.address = fields.VendorAddress.content;
    }
  }

  // ========== ORDER METADATA ==========
  if (fields?.InvoiceId) {
    orderDetails.orderId = fields.InvoiceId.content;
    confidenceScores.push(fields.InvoiceId.confidence || 0);
  }

  if (fields?.InvoiceDate) {
    orderDetails.orderDate = fields.InvoiceDate.content;
    confidenceScores.push(fields.InvoiceDate.confidence || 0);
  }

  if (fields?.DueDate) {
    orderDetails.dueDate = fields.DueDate.content;
  }

  // ========== LINE ITEMS (MOST IMPORTANT) ==========
  if (fields?.Items && 'values' in fields.Items && fields.Items.values) {
    const itemConfidences: number[] = [];

    (fields.Items.values as any[]).forEach((item: any, index: number) => {
      const itemFields = item.properties;

      // Extract description (try multiple field names)
      const description =
        itemFields?.Description?.content ||
        itemFields?.ProductDescription?.content ||
        itemFields?.Item?.content ||
        "";

      // Extract product code
      const productCode =
        itemFields?.ProductCode?.content ||
        itemFields?.ItemCode?.content ||
        itemFields?.Code?.content;

      // Extract quantity
      const quantityField = itemFields?.Quantity?.content || "1";
      const quantity = parseFloat(quantityField.toString().replace(/[^0-9.]/g, "")) || 1;

      // Extract unit
      const unit = itemFields?.Unit?.content;

      // Extract unit price
      let unitPrice: number | undefined;
      if (itemFields?.UnitPrice?.content) {
        unitPrice = parseFloat(
          itemFields.UnitPrice.content.toString().replace(/[^0-9.]/g, "")
        );
      }

      // Extract total price
      let totalPrice: number | undefined;
      if (itemFields?.Amount?.content) {
        totalPrice = parseFloat(
          itemFields.Amount.content.toString().replace(/[^0-9.]/g, "")
        );
      }

      // Calculate item confidence
      const itemConfidenceValues = [
        itemFields?.Description?.confidence,
        itemFields?.Quantity?.confidence,
        itemFields?.ProductCode?.confidence,
      ].filter((c) => c !== undefined && c !== null);

      const itemConfidence =
        itemConfidenceValues.length > 0
          ? itemConfidenceValues.reduce((sum, c) => sum + (c || 0), 0) /
            itemConfidenceValues.length
          : 0.5;

      itemConfidences.push(itemConfidence);

      orderDetails.lineItems.push({
        lineNumber: index + 1,
        productCode,
        description,
        quantity,
        unit,
        unitPrice,
        totalPrice,
        confidence: itemConfidence,
      });
    });

    // Calculate average line items confidence
    orderDetails.confidence.lineItems =
      itemConfidences.length > 0
        ? itemConfidences.reduce((sum, c) => sum + c, 0) / itemConfidences.length
        : 0;
  }

  // ========== TOTALS ==========
  if (fields?.SubTotal) {
    orderDetails.subtotal = parseFloat(
      fields.SubTotal.content?.toString().replace(/[^0-9.]/g, "") || "0"
    );
    totalsConfidenceScores.push(fields.SubTotal.confidence || 0);
  }

  if (fields?.TotalTax) {
    orderDetails.tax = parseFloat(
      fields.TotalTax.content?.toString().replace(/[^0-9.]/g, "") || "0"
    );
    totalsConfidenceScores.push(fields.TotalTax.confidence || 0);
  }

  if (fields?.InvoiceTotal) {
    orderDetails.total = parseFloat(
      fields.InvoiceTotal.content?.toString().replace(/[^0-9.]/g, "") || "0"
    );
    totalsConfidenceScores.push(fields.InvoiceTotal.confidence || 0);
  }

  if (fields?.CurrencyCode) {
    orderDetails.currency = fields.CurrencyCode.content;
  }

  // ========== CALCULATE CONFIDENCE SCORES ==========
  orderDetails.confidence.customerInfo =
    customerConfidenceScores.length > 0
      ? customerConfidenceScores.reduce((sum, c) => sum + c, 0) /
        customerConfidenceScores.length
      : 0;

  orderDetails.confidence.totals =
    totalsConfidenceScores.length > 0
      ? totalsConfidenceScores.reduce((sum, c) => sum + c, 0) /
        totalsConfidenceScores.length
      : 0;

  // Overall confidence (weighted)
  const weights = {
    customerInfo: 0.2,
    lineItems: 0.6, // Line items are most important
    totals: 0.2,
  };

  orderDetails.confidence.overall =
    orderDetails.confidence.customerInfo * weights.customerInfo +
    orderDetails.confidence.lineItems * weights.lineItems +
    orderDetails.confidence.totals * weights.totals;

  return orderDetails;
}

/**
 * Validate base64 string
 */
export function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, "base64").toString("base64") === str;
  } catch {
    return false;
  }
}
