
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { GenerationMode } from "@/types/generator";

interface GenerateButtonsProps {
  isGenerating: boolean;
  hasSelectedImages: boolean;
  areLayersReady: boolean;
  onGenerate: (mode: GenerationMode) => void;
}

const GenerateButtons = ({
  isGenerating,
  hasSelectedImages,
  areLayersReady,
  onGenerate
}: GenerateButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      <Button
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={isGenerating || !hasSelectedImages}
        onClick={() => onGenerate('selected')}
      >
        {isGenerating ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Selected
      </Button>
      <Button
        className="bg-gray-900 hover:bg-gray-800 text-white"
        disabled={isGenerating || !areLayersReady}
        onClick={() => onGenerate('random')}
      >
        {isGenerating ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Random
      </Button>
    </div>
  );
};

export default GenerateButtons;
