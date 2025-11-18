import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DietSectionProps {
  diet: any;
}

const DietSection = ({ diet }: DietSectionProps) => {
  const [loadingImage, setLoadingImage] = useState<string | null>(null);
  const [mealImages, setMealImages] = useState<Record<string, string>>({});

  const handleGenerateImage = async (mealName: string) => {
    setLoadingImage(mealName);
    try {
      const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(mealName)},food,healthy`;
      setMealImages((prev) => ({ ...prev, [mealName]: imageUrl }));
      toast.success("Image generated!");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setLoadingImage(null);
    }
  };

  if (!diet) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{diet.title || "Your Diet Plan"}</h3>
        <p className="text-muted-foreground">{diet.description}</p>
        {diet.dailyCalories && (
          <div className="flex gap-4 text-sm">
            <Badge variant="secondary" className="text-base">
              Target: {diet.dailyCalories} calories/day
            </Badge>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {diet.meals?.map((meal: any, index: number) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
              <CardTitle className="flex items-center justify-between">
                <span>{meal.name}</span>
                {meal.calories && <Badge variant="outline">{meal.calories} cal</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {meal.items?.map((item: any, itemIndex: number) => (
                <div key={itemIndex} className="border-l-4 border-secondary pl-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        {item.portion && <span>Portion: {item.portion}</span>}
                        {item.protein && <span>Protein: {item.protein}g</span>}
                        {item.carbs && <span>Carbs: {item.carbs}g</span>}
                        {item.fats && <span>Fats: {item.fats}g</span>}
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateImage(item.name)}
                      disabled={loadingImage === item.name}
                      className="ml-4"
                    >
                      {loadingImage === item.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {mealImages[item.name] && (
                    <img
                      src={mealImages[item.name]}
                      alt={item.name}
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

export default DietSection;
