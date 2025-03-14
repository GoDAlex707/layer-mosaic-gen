
import { Button } from "@/components/ui/button";
import { Layers, Archive, Download } from "lucide-react";

interface PreviewActionButtonsProps {
  hasSelectedImages: boolean;
  showLayerPreview: boolean;
  onToggleLayerPreview: () => void;
  generatedImages: string[];
  onBulkDownload: () => void;
  previewImage: string | null;
  onCopyImage: () => void;
  onDownload: () => void;
}

const PreviewActionButtons = ({
  hasSelectedImages,
  showLayerPreview,
  onToggleLayerPreview,
  generatedImages,
  onBulkDownload,
  previewImage,
  onCopyImage,
  onDownload
}: PreviewActionButtonsProps) => {
  const hasImage = previewImage || generatedImages.length > 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 w-full">
        <Button
          variant="outline"
          className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          onClick={onToggleLayerPreview}
          disabled={!hasSelectedImages}
        >
          <Layers className="h-4 w-4 mr-2" />
          {showLayerPreview ? "Show Image" : "Layer View"}
        </Button>
        <Button
          variant="outline"
          className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          disabled={generatedImages.length === 0}
          onClick={onBulkDownload}
        >
          <Archive className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 w-full">
        <Button
          variant="outline"
          className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          disabled={!hasImage}
          onClick={onCopyImage}
        >
          Copy
        </Button>
        <Button
          variant="outline"
          className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          disabled={!hasImage}
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </>
  );
};

export default PreviewActionButtons;
