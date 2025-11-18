import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = 'Generate a single short, powerful, and motivating fitness quote (maximum 20 words). Return ONLY the quote text, no attribution, no extra formatting.';

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const quote = data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');

    return new Response(
      JSON.stringify({ quote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating quote:', error);
    
    // Fallback quotes
    const fallbackQuotes = [
      "Your body can stand almost anything. It's your mind you have to convince.",
      "The only bad workout is the one that didn't happen.",
      "Push yourself, because no one else is going to do it for you.",
      "Success starts with self-discipline.",
      "The pain you feel today will be the strength you feel tomorrow."
    ];
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    
    return new Response(
      JSON.stringify({ quote: randomQuote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
