import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Heart, Zap } from "lucide-react";

interface TipsSectionProps {
  tips: any;
}

const TipsSection = ({ tips }: TipsSectionProps) => {
  if (!tips) return null;

  const iconMap: Record<string, any> = {
    lifestyle: Lightbulb,
    motivation: Heart,
    posture: Zap,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Tips & Motivation</h3>
        <p className="text-muted-foreground">Expert advice to help you succeed</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tips.sections?.map((section: any, index: number) => {
          const Icon = iconMap[section.type] || Lightbulb;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
                    <ul className="space-y-2">
                      {section.items?.map((item: string, itemIndex: number) => (
                        <li key={itemIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tips.motivation && (
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-none">
          <CardContent className="pt-6">
            <blockquote className="text-xl font-medium italic text-center">
              "{tips.motivation}"
            </blockquote>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TipsSection;
