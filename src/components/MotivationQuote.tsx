import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MotivationQuote = () => {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-motivation-quote");
      
      if (error) throw error;
      
      setQuote(data.quote);
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
