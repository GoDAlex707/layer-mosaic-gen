
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import LayerManager from "@/components/LayerManager";
import Preview from "@/components/Preview";
import GeneratorSettings from "@/components/GeneratorSettings";
import { Layer, GeneratorConfig, GenerationMode } from "@/types/generator";
import { 
  generateRandomCombination, 
  generateAllCombinations, 
  drawImageOnCanvas,
  generateSelectedCombination 
} from "@/services/generator";

const Index = () => {
  const { toast } = useToast();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    maxToGenerate: 10,
    imageWidth: 512,
    imageHeight: 512,
    randomMode: true,
    useOriginalSize: true
  });

  // Create a hidden canvas for generating images
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = config.imageWidth;
    canvas.height = config.imageHeight;
    canvasRef.current = canvas;
  }, [config.imageWidth, config.imageHeight]);

  // Update canvas size when config changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = config.imageWidth;
      canvasRef.current.height = config.imageHeight;
    }
  }, [config.imageWidth, config.imageHeight]);

  // Generate preview image when layers change or when an image is selected
  useEffect(() => {
    const generatePreview = async () => {
      if (!canvasRef.current) return;
      if (layers.length === 0 || layers.some(layer => layer.images.length === 0)) {
        setPreviewImage(null);
        return;
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      try {
        // Check if there are selected images in layers
        const hasSelectedImages = layers.some(layer => layer.images.some(img => img.selected));
        
        // Use selected images if available, otherwise generate random
        const combination = hasSelectedImages 
          ? generateSelectedCombination(layers)
          : generateRandomCombination(layers);
          
        const previewImageUrl = await drawImageOnCanvas(canvasRef.current, ctx, combination, config);
        setPreviewImage(previewImageUrl);
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    };

    generatePreview();
  }, [layers, config]);

  const handleGenerate = async (mode: GenerationMode) => {
    if (!canvasRef.current) return;
    if (layers.length === 0 || layers.some(layer => layer.images.length === 0)) {
      toast({
        title: "Cannot generate images",
        description: "Please add at least one image to each layer",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      let combinations: {[key: string]: string}[];
      
      // Determine which generation strategy to use based on mode
      if (mode === 'selected') {
        // Generate using selected images
        combinations = [generateSelectedCombination(layers)];
      } else if (mode === 'random' || config.randomMode) {
        // Generate random combinations
        combinations = Array.from({ length: config.maxToGenerate }).map(() => generateRandomCombination(layers));
      } else {
        // Generate all possible combinations (limited by maxToGenerate)
        combinations = generateAllCombinations(layers, config.maxToGenerate);
      }

      const images: string[] = [];
      
      // Use a timeout to allow the UI to update
      setTimeout(async () => {
        try {
          // Process each combination
          for (const combination of combinations) {
            const imageUrl = await drawImageOnCanvas(canvasRef.current!, ctx, combination, config);
            images.push(imageUrl);
          }
          
          setGeneratedImages(images);
          toast({
            title: "Generation complete!",
            description: `Generated ${images.length} image${images.length !== 1 ? 's' : ''}`,
          });
        } catch (error) {
          console.error('Error during image generation:', error);
          toast({
            title: "Generation error",
            description: "An error occurred while generating images",
            variant: "destructive",
          });
        } finally {
          setIsGenerating(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error setting up generation:', error);
      setIsGenerating(false);
      toast({
        title: "Generation error",
        description: "An error occurred while setting up the generator",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Create Your NFT Collection
        </motion.h1>
        
        <motion.div 
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-8 flex flex-col items-center">
            <LayerManager layers={layers} setLayers={setLayers} />
            <GeneratorSettings config={config} setConfig={setConfig} />
          </div>
          
          <div className="flex justify-center">
            <Preview 
              layers={layers}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
              previewImage={previewImage}
              generatedImages={generatedImages}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p>All images are processed locally on your device. No data is sent to our servers.</p>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
