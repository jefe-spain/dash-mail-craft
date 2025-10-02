import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from './FileUpload';
import { LoadingSpinner } from './LoadingSpinner';
import { ResponseBox } from './ResponseBox';
import { Send, Mail } from 'lucide-react';

export const EmailDashboard = () => {
  const [emailContent, setEmailContent] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compose');

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
      // Use production URL in production, proxy in development
      const apiUrl = import.meta.env.PROD 
        ? 'https://n8n-consultorsia.up.railway.app/webhook/puertas-tht-production'
        : '/api';
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setResponse(`¡Email enviado exitosamente!\n\nRespuesta del servidor:\n${JSON.stringify(result, null, 2)}`);
      } else {
        setResponse(`Error al enviar el email: ${result.message || 'Error desconocido'}`);
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