import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from './FileUpload';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseBox } from './ResponseBox';
import { Send, Mail, Server } from 'lucide-react';

// Types for Azure Server response
interface PdfAnalysisResult {
  fileName: string;
  fileSize: number;
  success: boolean;
  confidence?: number;
  orderDetails?: {
    orderId?: string;
    customer?: { name?: string };
    lineItems: Array<{
      description: string;
      quantity: number;
      productCode?: string;
    }>;
  };
  error?: string;
}

interface AzureServerResponse {
  success: boolean;
  data?: {
    emailData: {
      from: string;
      subject: string;
      body: string;
      attachmentsCount: number;
    };
    pdfAnalysis: PdfAnalysisResult[];
    summary: {
      totalPDFs: number;
      successfulAnalyses: number;
      failedAnalyses: number;
      averageConfidence: number;
    };
    processingTime: number;
  };
  error?: {
    message: string;
  };
}

// API Endpoint configuration
const API_ENDPOINTS = {
  n8n_dev: {
    label: 'N8N (Development)',
    url: import.meta.env.PROD 
      ? 'https://n8n-consultorsia.up.railway.app/webhook-test/puertas-tht-development'
      : '/api',
  },
  n8n_prod: {
    label: 'N8N (Production)',
    url: 'https://n8n-consultorsia.up.railway.app/webhook/puertas-tht-production',
  },
  azure_di_local: {
    label: 'Azure DI Server (Development)',
    url: import.meta.env.PROD 
      ? 'http://localhost:3001/process-email'
      : '/server/process-email',
  },
  azure_di: {
    label: 'Azure DI Server (Production)',
    url: 'https://puertas-tht-server-production.up.railway.app/process-email',
  },
};

export const EmailDashboard = () => {
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedEndpoint, setSelectedEndpoint] = useState<keyof typeof API_ENDPOINTS>('n8n_dev');
  const [isLocalServerHealthy, setIsLocalServerHealthy] = useState(false);

  // Check if local Azure DI server is running (only in development)
  useEffect(() => {
    const checkLocalServerHealth = async () => {
      // Only check in development mode
      if (import.meta.env.PROD) {
        setIsLocalServerHealthy(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/health', {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          setIsLocalServerHealthy(data.success && data.status === 'healthy');
          console.log('✅ Local Azure DI Server is healthy');
        } else {
          setIsLocalServerHealthy(false);
        }
      } catch (error) {
        // Server not running or not reachable
        setIsLocalServerHealthy(false);
        console.log('ℹ️ Local Azure DI Server not available (this is normal if not running)');
      }
    };

    checkLocalServerHealth();
  }, []);

  // Auto-switch endpoint if azure_di_local is selected but not available
  useEffect(() => {
    if (selectedEndpoint === 'azure_di_local' && (!isLocalServerHealthy || import.meta.env.PROD)) {
      console.log('⚠️ Switching from local server to n8n_dev (local server not available)');
      setSelectedEndpoint('n8n_dev');
    }
  }, [isLocalServerHealthy, selectedEndpoint]);

  const handleSend = async () => {
    if (!emailContent.trim()) return;

    setIsLoading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append('from', recipient);
    formData.append('subject', subject);
    formData.append('body', emailContent);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      // Get selected endpoint URL
      const apiUrl = API_ENDPOINTS[selectedEndpoint].url;
      
      console.log(`📡 Sending to: ${apiUrl} (${API_ENDPOINTS[selectedEndpoint].label})`);
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Format response based on endpoint
        let formattedResponse = '';
        
        if ((selectedEndpoint === 'azure_di' || selectedEndpoint === 'azure_di_local') && result.data?.pdfAnalysis) {
          // Special formatting for Azure DI Server response
          const azureResult = result as AzureServerResponse;
          formattedResponse = '✅ Email procesado con análisis de PDF\n\n';
          formattedResponse += `📧 Email:\n`;
          formattedResponse += `   De: ${azureResult.data!.emailData.from}\n`;
          formattedResponse += `   Asunto: ${azureResult.data!.emailData.subject}\n\n`;
          
          if (azureResult.data!.pdfAnalysis.length > 0) {
            formattedResponse += `📄 PDFs Analizados:\n\n`;
            azureResult.data!.pdfAnalysis.forEach((pdf: PdfAnalysisResult, index: number) => {
              formattedResponse += `${index + 1}. ${pdf.fileName}\n`;
              if (pdf.success && pdf.orderDetails) {
                formattedResponse += `   ✅ Análisis exitoso\n`;
                formattedResponse += `   🎯 Confianza: ${((pdf.confidence || 0) * 100).toFixed(1)}%\n`;
                formattedResponse += `   📦 Items encontrados: ${pdf.orderDetails.lineItems.length}\n`;
                
                if (pdf.orderDetails.orderId) {
                  formattedResponse += `   🆔 ID Pedido: ${pdf.orderDetails.orderId}\n`;
                }
                if (pdf.orderDetails.customer?.name) {
                  formattedResponse += `   👤 Cliente: ${pdf.orderDetails.customer.name}\n`;
                }
                
                formattedResponse += `\n   Artículos:\n`;
                pdf.orderDetails.lineItems.forEach((item, i: number) => {
                  formattedResponse += `      ${i + 1}. ${item.description}\n`;
                  formattedResponse += `         - Cantidad: ${item.quantity}\n`;
                  if (item.productCode) {
                    formattedResponse += `         - Código: ${item.productCode}\n`;
                  }
                });
              } else {
                formattedResponse += `   ❌ Error: ${pdf.error}\n`;
              }
              formattedResponse += '\n';
            });
            
            formattedResponse += `\n📊 Resumen:\n`;
            formattedResponse += `   Total PDFs: ${result.data.summary.totalPDFs}\n`;
            formattedResponse += `   Exitosos: ${result.data.summary.successfulAnalyses}\n`;
            formattedResponse += `   Fallidos: ${result.data.summary.failedAnalyses}\n`;
            formattedResponse += `   Confianza promedio: ${(result.data.summary.averageConfidence * 100).toFixed(1)}%\n`;
          }
          
          formattedResponse += `\n⏱️ Tiempo de procesamiento: ${result.data.processingTime}ms`;
        } else {
          // Default formatting for N8N endpoints
          formattedResponse = `¡Email enviado exitosamente!\n\nRespuesta del servidor:\n${JSON.stringify(result, null, 2)}`;
        }
        
        setResponse(formattedResponse);
      } else {
        setResponse(`Error al enviar el email: ${result.error?.message || result.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setResponse(`Error al enviar el email. Revisa la consola para más detalles.`);
    } finally {
      setIsLoading(false);
      setActiveTab('response');
    }
  };

  const resetForm = () => {
    setEmailContent('');
    setSubject('');
    setRecipient('');
    setAttachments([]);
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              PuertasTHT
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Automatizacion - Flujo de pruebas
          </p>
        </div>

        {/* Tabs */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Redactar</TabsTrigger>
                <TabsTrigger value="response" disabled={!response}>Respuesta</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="compose" className="space-y-6 mt-0">
                {/* Endpoint Selector */}
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Endpoint de Destino
                    {isLocalServerHealthy && !import.meta.env.PROD && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Local server disponible
                      </span>
                    )}
                  </Label>
                  <Select value={selectedEndpoint} onValueChange={(value) => setSelectedEndpoint(value as keyof typeof API_ENDPOINTS)}>
                    <SelectTrigger className="w-full transition-all duration-300 focus:shadow-md">
                      <SelectValue placeholder="Selecciona un endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(API_ENDPOINTS)
                        .filter(([key]) => {
                          // Only show azure_di_local if server is healthy and not in production
                          if (key === 'azure_di_local') {
                            return isLocalServerHealthy && !import.meta.env.PROD;
                          }
                          return true;
                        })
                        .map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {API_ENDPOINTS[selectedEndpoint].url}
                  </p>
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-sm font-medium">
                    De
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="Ingresa tu email (remitente)..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="transition-all duration-300 focus:shadow-md"
                    type="email"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Asunto
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Ingresa el asunto del email..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="transition-all duration-300 focus:shadow-md"
                  />
                </div>

                {/* Email Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Contenido del Email
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Escribe aquí el contenido de tu email..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="min-h-[200px] transition-all duration-300 focus:shadow-md resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Adjuntos</Label>
                  <FileUpload 
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSend}
                    disabled={!emailContent.trim() || isLoading}
                    variant="send"
                    size="lg"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Email
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                  >
                    Reiniciar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="response" className="mt-0">
                {response && <ResponseBox response={response} />}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};