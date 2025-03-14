
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneratorConfig } from "@/types/generator";

interface GeneratorSettingsProps {
  config: GeneratorConfig;
  setConfig: React.Dispatch<React.SetStateAction<GeneratorConfig>>;
}

const GeneratorSettings = ({ config, setConfig }: GeneratorSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfigChange = (field: keyof GeneratorConfig, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4 w-full max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-medium">Settings</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 hover-scale">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxToGenerate" className="text-sm">Max images to generate</Label>
                    <Input
                      id="maxToGenerate"
                      type="number"
                      value={config.maxToGenerate}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          handleConfigChange("maxToGenerate", value);
                        }
                      }}
                      min="1"
                      max="100"
                      className="border-gray-200 focus:ring-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageWidth" className="text-sm">Canvas width (px)</Label>
                    <Input
                      id="imageWidth"
                      type="number"
                      value={config.imageWidth}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          handleConfigChange("imageWidth", value);
                        }
                      }}
                      min="100"
                      max="2000"
                      className="border-gray-200 focus:ring-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageHeight" className="text-sm">Canvas height (px)</Label>
                    <Input
                      id="imageHeight"
                      type="number"
                      value={config.imageHeight}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          handleConfigChange("imageHeight", value);
                        }
                      }}
                      min="100"
                      max="2000"
                      className="border-gray-200 focus:ring-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="randomMode" className="text-sm">Random generation</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="randomMode"
                          checked={config.randomMode}
                          onCheckedChange={(checked) => handleConfigChange("randomMode", checked)}
                        />
                        <span className="text-sm font-medium text-gray-500">
                          {config.randomMode ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="relative group">
                        <Info className="h-4 w-4 text-gray-400" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          When enabled, generates random combinations instead of all possible combinations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                  <p>💡 TIP: Larger canvas sizes and more layers may require more processing time</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GeneratorSettings;
