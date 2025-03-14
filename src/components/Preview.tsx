
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Image, RefreshCw, Download, Copy } from "lucide-react";
import { Layer } from "@/types/generator";

interface PreviewProps {
  layers: Layer[];
  isGenerating: boolean;
  onGenerate: () => void;
  previewImage: string | null;
  generatedImages: string[];
}

const Preview = ({ layers, isGenerating, onGenerate, previewImage, generatedImages }: PreviewProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const areLayersReady = layers.length > 0 && layers.every(layer => layer.images.length > 0);

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="flex items-center space-x-2">
        <Image className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-medium">Preview & Generate</h2>
      </div>
      
      <Card className="overflow-hidden border-gray-200 hover-scale">
        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
            {(previewImage || generatedImages.length > 0) ? (
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
          
          {generatedImages.length > 1 && (
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
          
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              disabled={!previewImage && generatedImages.length === 0}
              onClick={handleCopyImage}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              disabled={!previewImage && generatedImages.length === 0}
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white"
              disabled={isGenerating || !areLayersReady}
              onClick={onGenerate}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
          
          {!areLayersReady && (
            <p className="text-sm text-amber-600">
              Please add at least one image to each layer before generating
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preview;
