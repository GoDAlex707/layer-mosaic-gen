
import { motion } from "framer-motion";
import { Image } from "lucide-react";
import { Layer } from "@/types/generator";

interface ImagePreviewDisplayProps {
  showLayerPreview: boolean;
  hasSelectedImages: boolean;
  layers: Layer[];
  previewImage: string | null;
  generatedImages: string[];
  currentImageIndex: number;
}

const ImagePreviewDisplay = ({
  showLayerPreview,
  hasSelectedImages,
  layers,
  previewImage,
  generatedImages,
  currentImageIndex
}: ImagePreviewDisplayProps) => {
  if (showLayerPreview && hasSelectedImages) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">Selected Layers Preview</div>
        <div className="flex-1 overflow-auto p-2">
          {layers.map(layer => {
            const selectedImage = layer.images.find(img => img.selected);
            if (!selectedImage) return null;
            
            return (
              <div key={layer.name} className="mb-2 last:mb-0 flex flex-col">
                <div className="text-xs text-gray-500 mb-1">{layer.name}</div>
                <div className="border border-gray-200 rounded overflow-hidden h-12 flex items-center p-1">
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name} 
                    className="h-full object-contain"
                  />
                  <span className="text-xs ml-2 text-gray-700">{selectedImage.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (previewImage || generatedImages.length > 0) {
    return (
      <motion.img
        key={generatedImages[currentImageIndex] || previewImage}
        src={generatedImages[currentImageIndex] || previewImage || ''}
        alt="NFT Preview"
        className="w-full h-full object-contain"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    );
  }

  return (
    <div className="text-gray-400 flex flex-col items-center">
      <Image className="h-12 w-12 mb-2 opacity-20" />
      <p>NFT preview will appear here</p>
    </div>
  );
};

export default ImagePreviewDisplay;
