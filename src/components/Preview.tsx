
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Image, RefreshCw, Download, Layers, Archive } from "lucide-react";
import { Layer, GenerationMode } from "@/types/generator";
import ImagePreviewDisplay from "./preview/ImagePreviewDisplay";
import ImageNavigation from "./preview/ImageNavigation";
import PreviewActionButtons from "./preview/PreviewActionButtons";
import GenerateButtons from "./preview/GenerateButtons";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface PreviewProps {
  layers: Layer[];
  isGenerating: boolean;
  onGenerate: (mode: GenerationMode) => void;
  previewImage: string | null;
  generatedImages: string[];
}

const Preview = ({ layers, isGenerating, onGenerate, previewImage, generatedImages }: PreviewProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLayerPreview, setShowLayerPreview] = useState(false);

  useEffect(() => {
    if (generatedImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [generatedImages]);
  
  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (generatedImages.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === generatedImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? generatedImages.length - 1 : prev - 1
      );
    }
  };

  const handleCopyImage = async () => {
    if (!previewImage && generatedImages.length === 0) return;
    
    const imageUrl = generatedImages[currentImageIndex] || previewImage;
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast({
        title: "Image copied!",
        description: "The image has been copied to your clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy the image to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!previewImage && generatedImages.length === 0) return;
    
    const imageUrl = generatedImages[currentImageIndex] || previewImage;
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nft-generation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded!",
      description: "Your NFT image has been saved to your device",
    });
  };

  const handleBulkDownload = async () => {
    if (generatedImages.length === 0) {
      toast({
        title: "No images to download",
        description: "Generate some images first",
        variant: "destructive",
      });
      return;
    }

    try {
      const zip = new JSZip();
      const folder = zip.folder("nft-collection");
      
      if (!folder) throw new Error("Could not create folder in zip");
      
      // Add each image to the zip with sequential naming
      const fetchPromises = generatedImages.map(async (dataUrl, index) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        folder.file(`${index}.png`, blob);
      });
      
      await Promise.all(fetchPromises);
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      // Save the zip file
      saveAs(content, `nft-collection-${Date.now()}.zip`);
      
      toast({
        title: "Collection downloaded!",
        description: `${generatedImages.length} images have been saved as a zip file`,
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast({
        title: "Download failed",
        description: "Could not create the zip file",
        variant: "destructive",
      });
    }
  };

  const toggleLayerPreview = () => {
    setShowLayerPreview(!showLayerPreview);
  };

  const areLayersReady = layers.length > 0 && layers.every(layer => layer.images.length > 0);
  const hasSelectedImages = layers.some(layer => layer.images.some(img => img.selected));

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="flex items-center space-x-2">
        <Image className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-medium">Preview & Generate</h2>
      </div>
      
      <Card className="overflow-hidden border-gray-200 hover-scale">
        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <ImagePreviewDisplay 
            showLayerPreview={showLayerPreview}
            hasSelectedImages={hasSelectedImages}
            layers={layers}
            previewImage={previewImage}
            generatedImages={generatedImages}
            currentImageIndex={currentImageIndex}
          />
          
          <ImageNavigation 
            generatedImages={generatedImages}
            currentImageIndex={currentImageIndex}
            showLayerPreview={showLayerPreview}
            onNavigate={handleImageNavigation}
          />
          
          <PreviewActionButtons 
            hasSelectedImages={hasSelectedImages}
            showLayerPreview={showLayerPreview}
            onToggleLayerPreview={toggleLayerPreview}
            generatedImages={generatedImages}
            onBulkDownload={handleBulkDownload}
            previewImage={previewImage}
            onCopyImage={handleCopyImage}
            onDownload={handleDownload}
          />
          
          <GenerateButtons 
            isGenerating={isGenerating}
            hasSelectedImages={hasSelectedImages}
            areLayersReady={areLayersReady}
            onGenerate={onGenerate}
          />
          
          {!areLayersReady && (
            <p className="text-sm text-amber-600">
              Please add at least one image to each layer before generating
            </p>
          )}
          {areLayersReady && !hasSelectedImages && (
            <p className="text-sm text-blue-600">
              Select images from each layer for custom generation
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
