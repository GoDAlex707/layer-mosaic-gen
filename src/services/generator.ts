
import { Layer, GeneratorConfig } from "@/types/generator";

export const generateRandomCombination = (layers: Layer[]): {[key: string]: string} => {
  const combination: {[key: string]: string} = {};
  
  layers.forEach(layer => {
    if (layer.images.length > 0) {
      const randomIndex = Math.floor(Math.random() * layer.images.length);
      combination[layer.name] = layer.images[randomIndex].url;
    }
  });
  
  return combination;
};

export const generateAllCombinations = (layers: Layer[], maxToGenerate: number): {[key: string]: string}[] => {
  // Recursive function to generate all combinations
  const generateCombinations = (layerIndex: number, currentCombination: {[key: string]: string} = {}): {[key: string]: string}[] => {
    if (layerIndex >= layers.length) {
      return [currentCombination];
    }
    
    const currentLayer = layers[layerIndex];
    const combinations: {[key: string]: string}[] = [];
    
    // If no images in this layer, skip to the next layer
    if (currentLayer.images.length === 0) {
      return generateCombinations(layerIndex + 1, currentCombination);
    }
    
    for (const image of currentLayer.images) {
      const newCombination = {
        ...currentCombination,
        [currentLayer.name]: image.url
      };
      
      const nextCombinations = generateCombinations(layerIndex + 1, newCombination);
      combinations.push(...nextCombinations);
      
      // If we've reached the maximum number of combinations to generate, stop
      if (combinations.length >= maxToGenerate) {
        return combinations.slice(0, maxToGenerate);
      }
    }
    
    return combinations;
  };
  
  return generateCombinations(0);
};

export const drawImageOnCanvas = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  layerImages: {[key: string]: string},
  config: GeneratorConfig
): Promise<string> => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create an array of layer names and sort them
  const layerNames = Object.keys(layerImages);
  
  // Draw each layer in order
  for (const layerName of layerNames) {
    const imageUrl = layerImages[layerName];
    await drawLayer(ctx, imageUrl, config.imageWidth, config.imageHeight);
  }
  
  // Return the data URL of the canvas
  return canvas.toDataURL('image/png');
};

const drawLayer = (
  ctx: CanvasRenderingContext2D, 
  imageUrl: string, 
  width: number, 
  height: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve();
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(error);
    };
    img.src = imageUrl;
  });
};
