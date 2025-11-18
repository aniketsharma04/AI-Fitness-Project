import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";


const MotivationQuote = () => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!GEMINI_API_KEY) throw new Error("Missing VITE_GEMINI_API_KEY in .env");
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Generate a single short, powerful, and motivating fitness quote (maximum 20 words). Return ONLY the quote text, no attribution, no extra formatting.' }]}],
          generationConfig: { temperature: 0.9, maxOutputTokens: 100 },
        }),
      });
      if (!resp.ok) throw new Error(`Gemini error: ${resp.status}`);
      const json = await resp.json();
      const q = (json.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().replace(/^(["'])|(["'])$/g, '');
      setQuote(q);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuote("Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="mb-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-none shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Quote className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium italic">{quote}</p>
            <p className="text-sm text-muted-foreground mt-2">— Daily Motivation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MotivationQuote;
