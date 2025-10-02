# 🚀 Quick Start Guide

## Step 1: Configure Azure Credentials

Edit `server/.env` file with your Azure Document Intelligence credentials:

```env
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-api-key-here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Get your credentials:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create/Open your **Document Intelligence** resource
3. Go to **Keys and Endpoint**
4. Copy **Endpoint** and **Key 1**

## Step 2: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
🚀 Dash Mail Craft - PDF Order Analysis Server
📡 Server running on: http://localhost:3001
📄 Azure Document Intelligence: Connected
🤖 Model: prebuilt-invoice
✨ Server ready to accept requests!
```

## Step 3: Test the Server

### Option A: Health Check
```bash
curl http://localhost:3001/health
```

### Option B: Test with a PDF
```bash
# Using the test script (easiest)
node test-endpoint.js /path/to/your/order.pdf

# Using curl
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfBase64": "base64-encoded-pdf-here",
    "fileName": "test-order.pdf"
  }'
```

### Option C: From JavaScript/React
```javascript
const analyzeOrder = async (file) => {
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    
    const response = await fetch('http://localhost:3001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfBase64: base64,
        fileName: file.name
      })
    });
    
    const result = await response.json();
    console.log('Analysis result:', result);
  };
  
  reader.readAsDataURL(file);
};
```

## Expected Response Format

```json
{
  "success": true,
  "data": {
    "orderDetails": {
      "orderId": "INV-001",
      "orderDate": "2025-10-02",
      "customer": {
        "name": "Customer Name",
        "address": "Customer Address"
      },
      "lineItems": [
        {
          "lineNumber": 1,
          "productCode": "PROD-001",
          "description": "Product Description",
          "quantity": 3,
          "unitPrice": 100,
          "totalPrice": 300,
          "confidence": 0.95
        }
      ],
      "total": 300,
      "confidence": {
        "overall": 0.92,
        "customerInfo": 0.88,
        "lineItems": 0.95,
        "totals": 0.93
      }
    },
    "rawAzureResponse": { /* Full Azure response */ },
    "processingTime": 1234
  }
}
```

## Common Issues

### ❌ "Missing required environment variables"
- Check your `.env` file exists and has the correct Azure credentials

### ❌ "Azure Document Intelligence client not initialized"
- Verify your endpoint URL format: `https://your-name.cognitiveservices.azure.com/`
- Ensure API key is valid

### ❌ "Not allowed by CORS"
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### ❌ Low confidence scores (<0.70)
- Ensure PDF is machine-readable (not a scanned image)
- Try a clearer/higher quality PDF
- Check if PDF structure matches invoice/order format

## Next Steps

1. **Integrate with RAG System**: Use the extracted `orderDetails` with your catalog validation prompt
2. **Add Vector Search**: Connect to Pinecone/similar for catalog matching
3. **Implement Validation**: Create endpoint to validate orders against catalog
4. **Build UI**: Create React component for PDF upload and results display

## 📚 Additional Resources

- Full documentation: `README.md`
- Azure DI Docs: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/
- Prebuilt Invoice Model: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept-invoice
