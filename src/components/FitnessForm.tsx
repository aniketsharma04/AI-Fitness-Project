import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";


interface FitnessFormProps {
  onPlanGenerated: (plan: any) => void;
}

const FitnessForm = ({ onPlanGenerated }: FitnessFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    fitnessLevel: "",
    location: "",
    diet: "",
    medical: "",
    stress: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are an expert fitness coach and nutritionist. Generate a comprehensive, personalized fitness and diet plan based on the following user information:\n\nName: ${formData.name}\nAge: ${formData.age}\nGender: ${formData.gender}\nHeight: ${formData.height}cm\nWeight: ${formData.weight}kg\nGoal: ${formData.goal}\nFitness Level: ${formData.fitnessLevel}\nWorkout Location: ${formData.location}\nDietary Preference: ${formData.diet}\n${formData.medical ? `Medical History: ${formData.medical}` : ''}\n${formData.stress ? `Stress Level: ${formData.stress}` : ''}\n\nCreate a detailed plan with:\n1. A 7-day workout plan with specific exercises, sets, reps, and rest times\n2. A comprehensive diet plan with breakfast, lunch, dinner, and snacks including calories and macros\n3. Lifestyle tips, posture advice, and motivational content\n\nReturn ONLY a valid JSON object with keys: workout.days[*].exercises[*], diet.meals[*].items[*], tips.sections[*].items[*].`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }]}],
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        });

        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`Gemini error: ${resp.status} ${t}`);
        }

        const json = await resp.json();
        const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const match = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```\n([\s\S]*?)\n```/);
        const text = match ? match[1] : generatedText;
        const plan = JSON.parse(text.trim());

        localStorage.setItem("fitnessplan", JSON.stringify(plan));
        toast.success("Your personalized plan is ready!");
        onPlanGenerated(plan);
      } catch (error: any) {
        console.error("Error generating plan:", error);
        toast.error(error.message || "Failed to generate plan. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const LOVABLE_API_KEY = import.meta.env.VITE_LOVABLE_API_KEY as string | undefined;

      if (LOVABLE_API_KEY) {
        const prompt = `You are an expert fitness coach and nutritionist. Generate a comprehensive, personalized fitness and diet plan based on the following user information:\n\nName: ${formData.name}\nAge: ${formData.age}\nGender: ${formData.gender}\nHeight: ${formData.height}cm\nWeight: ${formData.weight}kg\nGoal: ${formData.goal}\nFitness Level: ${formData.fitnessLevel}\nWorkout Location: ${formData.location}\nDietary Preference: ${formData.diet}\n${formData.medical ? `Medical History: ${formData.medical}` : ''}\n${formData.stress ? `Stress Level: ${formData.stress}` : ''}\n\nCreate a detailed plan with:\n1. A 7-day workout plan with specific exercises, sets, reps, and rest times\n2. A comprehensive diet plan with breakfast, lunch, dinner, and snacks including calories and macros\n3. Lifestyle tips, posture advice, and motivational content\n\nReturn ONLY a valid JSON object with this exact structure (no markdown, no extra text):\n{\n  "workout": {\n    "title": "Your Workout Plan",\n    "description": "Overview of the workout approach",\n    "days": [\n      {\n        "day": "Day 1 - Monday",\n        "focus": "Upper Body",\n        "exercises": [\n          {\n            "name": "Push-ups",\n            "sets": "3",\n            "reps": "12-15",\n            "rest": "60s",\n            "notes": "Keep core tight"\n          }\n        ]\n      }\n    ]\n  },\n  "diet": {\n    "title": "Your Nutrition Plan",\n    "description": "Overview of dietary approach",\n    "dailyCalories": "2000",\n    "meals": [\n      {\n        "name": "Breakfast",\n        "calories": "500",\n        "items": [\n          {\n            "name": "Oatmeal with fruits",\n            "portion": "1 cup",\n            "protein": "10",\n            "carbs": "45",\n            "fats": "8",\n            "notes": "Add honey for taste"\n          }\n        ]\n      }\n    ]\n  },\n  "tips": {\n    "sections": [\n      {\n        "type": "lifestyle",\n        "title": "Lifestyle Tips",\n        "items": ["Tip 1", "Tip 2"]\n      },\n      {\n        "type": "posture",\n        "title": "Posture & Form",\n        "items": ["Tip 1", "Tip 2"]\n      }\n    ],\n    "motivation": "An inspiring quote"\n  }\n}`;

        const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096,
          }),
        });

        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`AI error: ${resp.status} ${t}`);
        }

        const json = await resp.json();
        const generatedText = json.choices?.[0]?.message?.content || '';
        const match = generatedText.match(/```json\n([\s\S]*?)\n```/) || generatedText.match(/```\n([\s\S]*?)\n```/);
        const text = match ? match[1] : generatedText;
        const plan = JSON.parse(text.trim());

        localStorage.setItem("fitnessplan", JSON.stringify(plan));
        toast.success("Your personalized plan is ready!");
        onPlanGenerated(plan);
      } else {
        const { data, error } = await supabase.functions.invoke("generate-fitness-plan", { body: formData });
        if (error) {
          const message = (data && ((data as any).error || (data as any).message)) || error.message || "Failed to generate plan. Please try again.";
          toast.error(message);
          throw error;
        }
        if (!data?.plan) {
          toast.error("No plan returned from AI service");
          throw new Error("No plan returned");
        }
        localStorage.setItem("fitnessplan", JSON.stringify(data.plan));
        toast.success("Your personalized plan is ready!");
        onPlanGenerated(data.plan);
      }
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast.error(error.message || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Tell Us About Yourself</CardTitle>
        <CardDescription>
          Fill in your details to get a personalized fitness and nutrition plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Fitness Goal *</Label>
              <Select value={formData.goal} onValueChange={(value) => handleInputChange("goal", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitnessLevel">Fitness Level *</Label>
              <Select value={formData.fitnessLevel} onValueChange={(value) => handleInputChange("fitnessLevel", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Workout Location *</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet">Dietary Preference *</Label>
              <Select value={formData.diet} onValueChange={(value) => handleInputChange("diet", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stress">Stress Level</Label>
              <Select value={formData.stress} onValueChange={(value) => handleInputChange("stress", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical">Medical History (Optional)</Label>
            <Textarea
              id="medical"
              placeholder="Any injuries, conditions, or medications..."
              value={formData.medical}
              onChange={(e) => handleInputChange("medical", e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90 transition-opacity text-lg py-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate My AI Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FitnessForm;
