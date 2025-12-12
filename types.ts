export enum AppMode {
  CHAT = 'CHAT',
  VISION = 'VISION',
  IMAGE_GEN = 'IMAGE_GEN'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  images?: string[]; // base64 strings for user uploads
  groundingUrls?: Array<{uri: string; title: string}>;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
