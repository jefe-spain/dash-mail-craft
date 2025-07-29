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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('compose');

  const handleSend = async () => {
    if (!emailContent.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setResponse(`¡Email enviado exitosamente! 
    
Asunto: ${subject || 'Sin asunto'}
Contenido: ${emailContent.length} caracteres
Adjuntos: ${attachments.length} archivos

Tu email ha sido procesado y entregado a los destinatarios.`);
    setActiveTab('response');
  };

  const resetForm = () => {
    setEmailContent('');
    setSubject('');
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