import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import WorkoutSection from "@/components/WorkoutSection";
import DietSection from "@/components/DietSection";
import TipsSection from "@/components/TipsSection";

interface PlanDisplayProps {
  plan: any;
  onNewPlan: () => void;
}

const PlanDisplay = ({ plan, onNewPlan }: PlanDisplayProps) => {
  const [activeTab, setActiveTab] = useState("workout");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleExportPDF = () => {
    try {
      window.print();
      toast.success("Exporting as PDF...");
    } catch {
      toast.error("Failed to initiate PDF export");
    }
  };

  const handlePlayPlan = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsPlaying(false);
      toast.info("Stopped playback");
      return;
    }

    try {
      setIsPlaying(true);
      toast.info("Generating audio...");

      const workoutText = Array.isArray(plan.workout?.days)
        ? plan.workout.days
            .map((day: any) => `${day.day}: ${Array.isArray(day.exercises) ? day.exercises
              .map((ex: any) => `${ex.name}${ex.sets ? ` ${ex.sets} sets` : ''}${ex.reps ? ` of ${ex.reps}` : ''}${ex.rest ? `, rest ${ex.rest}` : ''}`)
              .join('; ') : ''}`)
            .join('. ')
        : 'No workout details available';

      const dietText = Array.isArray(plan.diet?.meals)
        ? plan.diet.meals
            .map((meal: any) => `${meal.name}: ${Array.isArray(meal.items) ? meal.items
              .map((item: any) => `${item.name}${item.portion ? ` (${item.portion})` : ''}`)
              .join('; ') : ''}`)
            .join('. ')
        : 'No diet details available';

      const tipsText = Array.isArray(plan.tips?.sections)
        ? plan.tips.sections
            .map((s: any) => `${s.title}: ${Array.isArray(s.items) ? s.items.join('; ') : ''}`)
            .join('. ')
        : '';

      const planText = `Your personalized fitness plan.\n\nWorkout Plan:\n${workoutText}\n\nDiet Plan:\n${dietText}\n\nTips:\n${tipsText}`;

      const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
      if (ELEVENLABS_API_KEY) {
        const voiceMap: Record<string, string> = {
          Sarah: 'EXAVITQu4vr4xnSDxMaL',
          Aria: '9BWtsMINqrJLrRacOk9x',
          Roger: 'CwhRBWXzGAHq8TQ4Fs17',
          Laura: 'FGY2WhTYpPnrIDTdsKH5',
          Charlie: 'IKne3meq5aSn9XLyUdCD',
        };
        const voiceId = voiceMap['Sarah'];
        const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: planText,
            model_id: 'eleven_turbo_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(`ElevenLabs error: ${resp.status} ${t}`);
        }
        const audioBuffer = await resp.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
      } else {
        const { data, error } = await supabase.functions.invoke('text-to-speech', { body: { text: planText, voice: 'Sarah' } });
        if (error) throw error;
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
      }
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast.success("Finished playing plan");
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast.error("Error playing audio");
      };

      await audioRef.current.play();
      toast.success("Playing your plan");

    } catch (error) {
      console.error('Error playing plan:', error);
      setIsPlaying(false);
      toast.error("Failed to play plan");
    }
  };

  return (
    <div id="print-area" className="max-w-6xl mx-auto space-y-6">
      {/* Action Buttons */}
      <div className="no-print flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-3xl font-bold">Your Personalized Plan</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePlayPlan} disabled={isPlaying && !audioRef.current}>
            {isPlaying ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
            {isPlaying ? "Stop" : "Read Plan"}
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={onNewPlan} className="bg-gradient-to-r from-primary to-orange-500">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Plan Tabs */}
      <Card className="shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workout">Workout Plan</TabsTrigger>
              <TabsTrigger value="diet">Diet Plan</TabsTrigger>
              <TabsTrigger value="tips">Tips & Motivation</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="workout" className="space-y-4">
              <WorkoutSection workout={plan.workout} />
            </TabsContent>
            <TabsContent value="diet" className="space-y-4">
              <DietSection diet={plan.diet} />
            </TabsContent>
            <TabsContent value="tips" className="space-y-4">
              <TipsSection tips={plan.tips} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlanDisplay;
