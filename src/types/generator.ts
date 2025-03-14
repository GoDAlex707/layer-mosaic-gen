
export interface ImageItem {
  id: string;
  name: string;
  url: string;
}

export interface Layer {
  name: string;
  images: ImageItem[];
}

export interface GeneratorConfig {
  maxToGenerate: number;
  imageWidth: number;
  imageHeight: number;
  randomMode: boolean;
}
