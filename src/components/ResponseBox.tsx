import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

interface ResponseBoxProps {
  response: string;
}

export const ResponseBox = ({ response }: ResponseBoxProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-lg border-0 bg-emerald-50/50 border-emerald-200/50 animate-scale-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-emerald-700">
          <CheckCircle className="h-5 w-5" />
          Email Sent Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 rounded-lg p-4 border border-emerald-200/30">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
            {response}
          </pre>
        </div>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full border-emerald-200 hover:bg-emerald-50"
        >
          <Copy className="h-4 w-4 mr-2" />
          {copied ? 'Copied!' : 'Copy Response'}
        </Button>
      </CardContent>
    </Card>
  );
};