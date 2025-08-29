import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface ResponseBoxProps {
  response: string;
}

export const ResponseBox = ({ response }: ResponseBoxProps) => {
  const [copied, setCopied] = useState(false);
  let output = '';

    try {
    // Find the start of the JSON array in the response string
    const jsonStartIndex = response.indexOf('[');
    if (jsonStartIndex !== -1) {
      const jsonString = response.substring(jsonStartIndex);
      const parsedResponse = JSON.parse(jsonString);
      if (Array.isArray(parsedResponse) && parsedResponse.length > 0 && parsedResponse[0].output) {
        output = parsedResponse[0].output;
      } else {
        // If parsing succeeds but the structure is wrong, format it as a code block
        output = `~~~json\n${JSON.stringify(parsedResponse, null, 2)}\n~~~`;
      }
    } else {
      // If no JSON array is found, display the original response
      output = response;
    }
  } catch (error) {
    // If parsing fails, fall back to displaying the original response
    output = response;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-lg border-0 bg-emerald-50/50 border-emerald-200/50 animate-scale-in">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <CheckCircle className="h-5 w-5" />
          Respuesta del Servidor
        </CardTitle>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="border-emerald-200 hover:bg-emerald-50"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copied ? '¡Copiado!' : 'Copiar Respuesta'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 rounded-lg p-4 border border-emerald-200/30 prose dark:prose-invert max-w-none whitespace-pre-wrap">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {output}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};