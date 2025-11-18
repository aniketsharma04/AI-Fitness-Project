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

      // Convert plan to readable text
      const planText = `
        Your personalized fitness plan.
        
        Workout Plan:
        ${plan.workout.exercises.map((ex: any) => 
          `${ex.name}: ${ex.sets} sets of ${ex.reps} repetitions`
        ).join('. ')}
        
        Diet Plan:
        ${plan.diet.meals.map((meal: any) => 
          `${meal.name}: ${meal.description}`
        ).join('. ')}
        
        Tips:
        ${plan.tips.join('. ')}
      `;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: planText, voice: 'Sarah' }
      });

      if (error) throw error;

      // Convert base64 to audio and play
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      
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
