
export interface ImageState {
  original: string | null;
  processed: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface EditRequest {
  image: string; // base64
  prompt: string;
}
