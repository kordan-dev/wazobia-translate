export interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
  confidenceScore?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface STTResponse {
  text: string;
}

export interface MTResponse {
  translatedText: string;
  confidenceScore: number;
}

export interface TTSResponse {
  audioUrl: string;
}