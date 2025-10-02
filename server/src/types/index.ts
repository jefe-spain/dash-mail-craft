/**
 * TypeScript types for the server
 */

/**
 * Request body for /analyze endpoint
 */
export interface AnalyzeRequest {
  pdfBase64: string;
  fileName?: string;
}

/**
 * Structured order details extracted from PDF
 */
export interface OrderDetails {
  orderId?: string;
  orderDate?: string;
  dueDate?: string;
  customer: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  vendor?: {
    name?: string;
    address?: string;
    phone?: string;
  };
  lineItems: Array<{
    lineNumber: number;
    productCode?: string;
    description: string;
    quantity: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
    confidence: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  specialInstructions?: string;
  confidence: {
    overall: number;
    customerInfo: number;
    lineItems: number;
    totals: number;
  };
}

/**
 * Response from /analyze endpoint
 */
export interface AnalyzeResponse {
  success: boolean;
  data?: {
    orderDetails: OrderDetails;
    rawAzureResponse: any; // Raw Azure Document Intelligence response
    processingTime: number; // milliseconds
  };
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
