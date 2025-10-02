# Dash Mail Craft - PDF Order Analysis Server

Express server for analyzing PDF order documents using Azure Document Intelligence with the `prebuilt-invoice` model.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Azure credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-api-key-here
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 3. Get Azure Credentials

If you don't have Azure Document Intelligence credentials yet:

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a **Document Intelligence** resource
3. Navigate to **Keys and Endpoint**
4. Copy the **Endpoint** and **Key 1**

### 4. Start the Server

#### Development mode (with auto-reload):
```bash
npm run dev
```

#### Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### POST `/analyze`

Analyzes a PDF document and extracts order information.

**Request:**
```json
{
  "pdfBase64": "base64-encoded-pdf-string",
  "fileName": "optional-filename.pdf"
}
```

**Response (Success):**
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
          "productCode": "PI-2040",
          "description": "Puerta Interior Lisa",
          "quantity": 3,
          "unitPrice": 150.00,
          "totalPrice": 450.00,
          "confidence": 0.95
        }
      ],
      "subtotal": 450.00,
      "tax": 90.00,
      "total": 540.00,
      "confidence": {
        "overall": 0.92,
        "customerInfo": 0.88,
        "lineItems": 0.95,
        "totals": 0.93
      }
    },
    "rawAzureResponse": { /* Full Azure Document Intelligence response */ },
    "processingTime": 1234
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": "Additional details (in development mode)"
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-02T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### GET `/analyze/health`

Specific health check for the analyze endpoint.

## 🧪 Testing the Server

### Using cURL

```bash
# Convert PDF to base64
base64 -i your-order.pdf -o order-base64.txt

# Test the endpoint
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfBase64": "'$(cat order-base64.txt)'",
    "fileName": "test-order.pdf"
  }'
```

### Using JavaScript/Fetch

```javascript
// Read file as base64
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onload = async (e) => {
  const base64 = e.target.result.split(',')[1]; // Remove data:application/pdf;base64,
  
  const response = await fetch('http://localhost:3001/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfBase64: base64,
      fileName: file.name,
    }),
  });
  
  const result = await response.json();
  console.log(result);
};

reader.readAsDataURL(file);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Azure DI endpoint URL | Required |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Azure DI API key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | localhost:5173,localhost:5174 |

### File Size Limits

The server accepts PDFs up to **10MB** in size. To change this:

Edit `src/index.ts`:
```typescript
app.use(express.json({ limit: "10mb" })); // Change to desired size
```

## 📚 Azure Document Intelligence Models

### Current: `prebuilt-invoice`

Best for structured commercial documents like:
- Purchase orders
- Invoices
- Sales orders
- Quotations

Extracts:
- Customer information
- Line items with quantities and prices
- Totals and taxes
- Order metadata (ID, dates)

### Alternative Models

If you need to change the model, edit `src/services/documentIntelligence.ts`:

```typescript
const poller = await getClient().beginAnalyzeDocument(
  "prebuilt-document", // or "prebuilt-layout" for table-only extraction
  pdfBuffer
);
```

Available models:
- `prebuilt-invoice` - Invoices and orders (current)
- `prebuilt-document` - General documents
- `prebuilt-layout` - Tables and structure
- Custom models - Trained on your specific format

## 🔒 Security Notes

1. **Never commit `.env`** - Contains sensitive API keys
2. **CORS Configuration** - Only allow trusted origins in production
3. **API Key Rotation** - Regularly rotate Azure API keys
4. **HTTPS** - Use HTTPS in production (e.g., with reverse proxy)
5. **Rate Limiting** - Consider adding rate limiting for production

## 📊 Confidence Scores

The server returns confidence scores at multiple levels:

- `confidence.overall` - Overall extraction confidence (weighted)
- `confidence.customerInfo` - Customer data confidence
- `confidence.lineItems` - Average confidence across all items
- `confidence.totals` - Financial totals confidence
- Each line item has individual confidence score

**Interpretation:**
- ≥ 0.90: High confidence - exact match
- 0.70-0.89: Medium confidence - good match
- < 0.70: Low confidence - manual review recommended

## 🐛 Troubleshooting

### "Azure Document Intelligence client not initialized"
- Check your `.env` file has correct credentials
- Verify endpoint URL format includes `https://` and trailing `/`

### "Not allowed by CORS"
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Multiple origins: `http://localhost:3000,http://localhost:5173`

### "Invalid base64 format"
- Ensure PDF is properly base64 encoded
- Remove any `data:application/pdf;base64,` prefix

### Low confidence scores
- Try a clearer/higher quality PDF
- Ensure PDF is not scanned/image-based
- Consider using OCR preprocessing for scanned documents

## 📖 References

- [Azure Document Intelligence Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
- [Prebuilt Invoice Model](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept-invoice)
- [Express.js Documentation](https://expressjs.com/)

## 📝 License

MIT
