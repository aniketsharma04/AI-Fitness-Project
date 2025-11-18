import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Dumbbell } from "lucide-react";
import FitnessForm from "@/components/FitnessForm";
import PlanDisplay from "@/components/PlanDisplay";
import MotivationQuote from "@/components/MotivationQuote";

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handlePlanGenerated = (generatedPlan: any) => {
    setPlan(generatedPlan);
    setShowForm(false);
  };

  const handleNewPlan = () => {
    setPlan(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-orange-500 p-2 rounded-xl">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              AI Fitness Coach
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {showForm && !plan && (
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Transform Your Body with
              <span className="block bg-gradient-to-r from-primary via-orange-500 to-secondary bg-clip-text text-transparent">
                AI-Powered Training
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get personalized workout and diet plans tailored to your goals, fitness level, and preferences
            </p>
          </div>
        )}

        {/* Motivation Quote */}
        <MotivationQuote />

        {/* Form or Plan Display */}
        {showForm ? (
          <FitnessForm onPlanGenerated={handlePlanGenerated} />
        ) : (
          <PlanDisplay plan={plan} onNewPlan={handleNewPlan} />
        )}
      </main>
    </div>
  );
};

export default Index;
