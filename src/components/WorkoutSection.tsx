import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutSectionProps {
  workout: any;
}

const WorkoutSection = ({ workout }: WorkoutSectionProps) => {
  const [loadingImage, setLoadingImage] = useState<string | null>(null);
  const [exerciseImages, setExerciseImages] = useState<Record<string, string>>({});

  const handleGenerateImage = async (exerciseName: string) => {
    setLoadingImage(exerciseName);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercise-image", {
        body: { prompt: `A professional fitness demonstration of ${exerciseName} exercise in a gym setting, high quality, detailed` },
      });

      if (error) throw error;

      setExerciseImages((prev) => ({ ...prev, [exerciseName]: data.image }));
      toast.success("Image generated!");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setLoadingImage(null);
    }
  };

  if (!workout) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{workout.title || "Your Workout Plan"}</h3>
        <p className="text-muted-foreground">{workout.description}</p>
      </div>

      <div className="grid gap-4">
        {workout.days?.map((day: any, index: number) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardTitle className="flex items-center justify-between">
                <span>{day.day}</span>
                <Badge variant="secondary">{day.focus}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {day.exercises?.map((exercise: any, exIndex: number) => (
                <div key={exIndex} className="border-l-4 border-primary pl-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{exercise.name}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {exercise.sets && <span>Sets: {exercise.sets}</span>}
                        {exercise.reps && <span>Reps: {exercise.reps}</span>}
                        {exercise.duration && <span>Duration: {exercise.duration}</span>}
                        {exercise.rest && <span>Rest: {exercise.rest}</span>}
                      </div>
                      {exercise.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{exercise.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateImage(exercise.name)}
                      disabled={loadingImage === exercise.name}
                      className="ml-4"
                    >
                      {loadingImage === exercise.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {exerciseImages[exercise.name] && (
                    <img
                      src={exerciseImages[exercise.name]}
                      alt={exercise.name}
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkoutSection;
