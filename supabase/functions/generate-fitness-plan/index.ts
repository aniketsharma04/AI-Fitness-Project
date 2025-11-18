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
    const formData = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating fitness plan for:', formData.name);

    const prompt = `You are an expert fitness coach and nutritionist. Generate a comprehensive, personalized fitness and diet plan based on the following user information:

Name: ${formData.name}
Age: ${formData.age}
Gender: ${formData.gender}
Height: ${formData.height}cm
Weight: ${formData.weight}kg
Goal: ${formData.goal}
Fitness Level: ${formData.fitnessLevel}
Workout Location: ${formData.location}
Dietary Preference: ${formData.diet}
${formData.medical ? `Medical History: ${formData.medical}` : ''}
${formData.stress ? `Stress Level: ${formData.stress}` : ''}

Create a detailed plan with:
1. A 7-day workout plan with specific exercises, sets, reps, and rest times
2. A comprehensive diet plan with breakfast, lunch, dinner, and snacks including calories and macros
3. Lifestyle tips, posture advice, and motivational content

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "workout": {
    "title": "Your Workout Plan",
    "description": "Overview of the workout approach",
    "days": [
      {
        "day": "Day 1 - Monday",
        "focus": "Upper Body",
        "exercises": [
          {
            "name": "Push-ups",
            "sets": "3",
            "reps": "12-15",
            "rest": "60s",
            "notes": "Keep core tight"
          }
        ]
      }
    ]
  },
  "diet": {
    "title": "Your Nutrition Plan",
    "description": "Overview of dietary approach",
    "dailyCalories": "2000",
    "meals": [
      {
        "name": "Breakfast",
        "calories": "500",
        "items": [
          {
            "name": "Oatmeal with fruits",
            "portion": "1 cup",
            "protein": "10",
            "carbs": "45",
            "fats": "8",
            "notes": "Add honey for taste"
          }
        ]
      }
    ]
  },
  "tips": {
    "sections": [
      {
        "type": "lifestyle",
        "title": "Lifestyle Tips",
        "items": ["Tip 1", "Tip 2"]
      },
      {
        "type": "posture",
        "title": "Posture & Form",
        "items": ["Tip 1", "Tip 2"]
      }
    ],
    "motivation": "An inspiring quote"
  }
}`;

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
          temperature: 0.7,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    console.log('Generated text:', generatedText);

    // Extract JSON from the response (handle markdown code blocks)
    let planJson;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/```\n([\s\S]*?)\n```/);
      
      const jsonText = jsonMatch ? jsonMatch[1] : generatedText;
      planJson = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Generated text:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ plan: planJson }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-fitness-plan:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate plan' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
