
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Image, RefreshCw, Download, Layers, FileZip } from "lucide-react";
import { Layer, GenerationMode } from "@/types/generator";
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
  const [copied, setCopied] = useState(false);
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
      
      setCopied(true);
      toast({
        title: "Image copied!",
        description: "The image has been copied to your clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
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
          <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
            {showLayerPreview && hasSelectedImages ? (
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
            ) : (previewImage || generatedImages.length > 0) ? (
              <motion.img
                key={generatedImages[currentImageIndex] || previewImage}
                src={generatedImages[currentImageIndex] || previewImage || ''}
                alt="NFT Preview"
                className="w-full h-full object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Image className="h-12 w-12 mb-2 opacity-20" />
                <p>NFT preview will appear here</p>
              </div>
            )}
          </div>
          
          {generatedImages.length > 1 && !showLayerPreview && (
            <div className="flex items-center justify-center w-full space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleImageNavigation('prev')}
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
                onClick={() => handleImageNavigation('next')}
              >
                Next
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={toggleLayerPreview}
              disabled={!hasSelectedImages}
            >
              <Layers className="h-4 w-4 mr-2" />
              {showLayerPreview ? "Show Image" : "Layer View"}
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              disabled={generatedImages.length === 0}
              onClick={handleBulkDownload}
            >
              <FileZip className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              disabled={!previewImage && generatedImages.length === 0}
              onClick={handleCopyImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              disabled={!previewImage && generatedImages.length === 0}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
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
