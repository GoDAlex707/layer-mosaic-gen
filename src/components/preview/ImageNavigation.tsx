
import { Button } from "@/components/ui/button";

interface ImageNavigationProps {
  generatedImages: string[];
  currentImageIndex: number;
  showLayerPreview: boolean;
  onNavigate: (direction: 'next' | 'prev') => void;
}

const ImageNavigation = ({
  generatedImages,
  currentImageIndex,
  showLayerPreview,
  onNavigate
}: ImageNavigationProps) => {
  if (generatedImages.length <= 1 || showLayerPreview) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full space-x-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs"
        onClick={() => onNavigate('prev')}
      >
        Previous
      </Button>
      <div className="text-sm text-gray-500">
        {currentImageIndex + 1} / {generatedImages.length}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs"
        onClick={() => onNavigate('next')}
      >
        Next
      </Button>
    </div>
  );
};

export default ImageNavigation;
