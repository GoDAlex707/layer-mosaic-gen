import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Upload, X, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";
import { Layer } from "@/types/generator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface LayerManagerProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

const LayerManager = ({ layers, setLayers }: LayerManagerProps) => {
  const { toast } = useToast();
  const [newLayerName, setNewLayerName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLayer = () => {
    if (!newLayerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a layer name",
        variant: "destructive",
      });
      return;
    }

    if (layers.some(layer => layer.name === newLayerName)) {
      toast({
        title: "Error",
        description: "Layer name already exists",
        variant: "destructive",
      });
      return;
    }

    setLayers([...layers, { name: newLayerName, images: [], collapsed: false }]);
    setNewLayerName("");
    
    toast({
      title: "Success",
      description: `Layer "${newLayerName}" added`,
    });
  };

  const handleRemoveLayer = (index: number) => {
    const layerName = layers[index].name;
    setLayers(layers.filter((_, i) => i !== index));
    
    toast({
      title: "Layer removed",
      description: `"${layerName}" has been removed`,
    });
  };

  const handleMoveLayer = (index: number, direction: "up" | "down") => {
    const newLayers = [...layers];
    if (direction === "up" && index > 0) {
      [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
    } else if (direction === "down" && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    }
    setLayers(newLayers);
  };

  const toggleLayerCollapse = (index: number) => {
    const newLayers = [...layers];
    newLayers[index] = {
      ...newLayers[index],
      collapsed: !newLayers[index].collapsed
    };
    setLayers(newLayers);
  };

  const triggerFileInput = (layerIndex: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-layer-index', layerIndex.toString());
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const layerIndex = parseInt(e.target.getAttribute('data-layer-index') || "0", 10);
    const currentLayer = layers[layerIndex];
    
    if (!currentLayer) return;
    
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    const updatedLayers = [...layers];
    updatedLayers[layerIndex] = {
      ...currentLayer,
      images: [...currentLayer.images, ...newImages]
    };
    
    setLayers(updatedLayers);
    
    toast({
      title: "Images added",
      description: `${files.length} images added to "${currentLayer.name}"`,
    });
    
    e.target.value = '';
  };

  const handleRemoveImage = (layerIndex: number, imageId: string) => {
    const updatedLayers = [...layers];
    const layer = { ...updatedLayers[layerIndex] };
    
    layer.images = layer.images.filter(img => img.id !== imageId);
    updatedLayers[layerIndex] = layer;
    
    setLayers(updatedLayers);
  };

  const handleSelectImage = (layerIndex: number, imageId: string) => {
    const updatedLayers = [...layers];
    const layer = { ...updatedLayers[layerIndex] };
    const imageToUpdate = layer.images.find(img => img.id === imageId);
    
    if (imageToUpdate && imageToUpdate.selected) {
      layer.images = layer.images.map(img => ({
        ...img,
        selected: img.id === imageId ? false : img.selected
      }));
      
      updatedLayers[layerIndex] = layer;
      setLayers(updatedLayers);
      
      toast({
        title: "Image deselected",
        description: `Image deselected from "${layer.name}" layer`,
      });
      return;
    }
    
    layer.images = layer.images.map(img => ({
      ...img,
      selected: img.id === imageId
    }));
    
    updatedLayers[layerIndex] = layer;
    setLayers(updatedLayers);
    
    toast({
      title: "Image selected",
      description: `Image selected for "${layer.name}" layer`,
    });
  };

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="flex items-center space-x-2">
        <Layers className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-medium">Layers</h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Layer name (e.g., Background, Body, Face)"
          value={newLayerName}
          onChange={(e) => setNewLayerName(e.target.value)}
          className="flex-1 border-gray-200 focus:ring-gray-300"
        />
        <Button onClick={handleAddLayer} className="bg-gray-900 hover:bg-gray-800 text-white">
          Add Layer
        </Button>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence>
          {layers.map((layer, index) => (
            <motion.div
              key={`${layer.name}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Collapsible
                open={!layer.collapsed}
                onOpenChange={() => toggleLayerCollapse(index)}
                className="border border-gray-200 rounded-md hover-scale"
              >
                <div className="flex justify-between items-center p-4 bg-white">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {layer.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                        <div className="bg-gray-100 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <h3 className="font-medium">{layer.name}</h3>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveLayer(index, "up")}
                      disabled={index === 0}
                      className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveLayer(index, "down")}
                      disabled={index === layers.length - 1}
                      className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveLayer(index)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CollapsibleContent>
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => triggerFileInput(index)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Images
                      </Button>
                    </div>
                    
                    {layer.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {layer.images.map((image) => (
                          <div 
                            key={image.id} 
                            className={`relative group cursor-pointer ${image.selected ? 'ring-2 ring-blue-500 rounded-md' : ''}`}
                            onClick={() => handleSelectImage(index, image.id)}
                          >
                            <img 
                              src={image.url} 
                              alt={image.name} 
                              className="w-full h-16 object-cover rounded-md border border-gray-200 bg-gray-50"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index, image.id);
                              }}
                              className="absolute top-0 right-0 bg-white/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="text-xs truncate mt-1 text-gray-500">{image.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default LayerManager;
