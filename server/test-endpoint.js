/**
 * Test script for the /analyze endpoint
 * Usage: node test-endpoint.js <path-to-pdf>
 */

const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function testAnalyzeEndpoint(pdfPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ File not found:', pdfPath);
      process.exit(1);
    }

    // Read PDF file
    console.log('📄 Reading PDF file:', pdfPath);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    const fileName = path.basename(pdfPath);

    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`📡 Sending request to: ${SERVER_URL}/analyze`);
    console.log('⏳ Processing...\n');

    const startTime = Date.now();

    // Send request
    const response = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64,
        fileName,
      }),
    });

    const processingTime = Date.now() - startTime;

    // Parse response
    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error response:', result);
      process.exit(1);
    }

    if (result.success) {
      console.log('✅ Analysis successful!\n');
      console.log('='.repeat(60));
      console.log('📊 RESULTS');
      console.log('='.repeat(60));

      const { orderDetails } = result.data;

      console.log('\n📋 Order Information:');
      console.log(`   Order ID: ${orderDetails.orderId || 'N/A'}`);
      console.log(`   Date: ${orderDetails.orderDate || 'N/A'}`);
      console.log(`   Customer: ${orderDetails.customer?.name || 'N/A'}`);

      console.log('\n📦 Line Items:');
      orderDetails.lineItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.description}`);
        console.log(`      Code: ${item.productCode || 'N/A'}`);
        console.log(`      Quantity: ${item.quantity}`);
        console.log(`      Confidence: ${(item.confidence * 100).toFixed(1)}%`);
      });

      console.log('\n💰 Totals:');
      console.log(`   Subtotal: ${orderDetails.subtotal || 'N/A'}`);
      console.log(`   Tax: ${orderDetails.tax || 'N/A'}`);
      console.log(`   Total: ${orderDetails.total || 'N/A'}`);

      console.log('\n🎯 Confidence Scores:');
      console.log(`   Overall: ${(orderDetails.confidence.overall * 100).toFixed(1)}%`);
      console.log(`   Customer Info: ${(orderDetails.confidence.customerInfo * 100).toFixed(1)}%`);
      console.log(`   Line Items: ${(orderDetails.confidence.lineItems * 100).toFixed(1)}%`);
      console.log(`   Totals: ${(orderDetails.confidence.totals * 100).toFixed(1)}%`);

      console.log('\n⏱️ Processing Time:');
      console.log(`   Client to Server: ${processingTime}ms`);
      console.log(`   Azure Processing: ${result.data.processingTime}ms`);

      console.log('\n' + '='.repeat(60));
      console.log('✨ Test completed successfully!');
      console.log('='.repeat(60) + '\n');

      // Optionally save full response to file
      const outputFile = `test-output-${Date.now()}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      console.log(`💾 Full response saved to: ${outputFile}\n`);
    } else {
      console.error('❌ Analysis failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node test-endpoint.js <path-to-pdf>');
  console.log('Example: node test-endpoint.js ../sample-order.pdf');
  process.exit(1);
}

const pdfPath = args[0];
testAnalyzeEndpoint(pdfPath);
