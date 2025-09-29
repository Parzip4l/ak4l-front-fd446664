import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PageHeader({ title, description, buttonText, onButtonClick }) {
  return (
    <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white">{title}</h1>
          <p className="text-white/80 text-lg mt-1">{description}</p>
        </div>
        {buttonText && (
          <Button
            onClick={onButtonClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg mt-4 sm:mt-0"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
