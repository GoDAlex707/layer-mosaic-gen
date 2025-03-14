
export interface ImageItem {
  id: string;
  name: string;
  url: string;
  selected?: boolean;
}

export interface Layer {
  name: string;
  images: ImageItem[];
  collapsed?: boolean;
}

export interface GeneratorConfig {
  maxToGenerate: number;
  imageWidth: number;
  imageHeight: number;
  randomMode: boolean;
  useOriginalSize?: boolean;
}
