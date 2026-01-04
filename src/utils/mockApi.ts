import { ApiResponse, STTResponse, MTResponse, TTSResponse } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockTranslations: Record<string, Record<string, string>> = {
  'en-yo': {
    'hello': 'Báwo',
    'how are you': 'Báwo ni?',
    'thank you': 'E se',
    'good morning': 'E kaaro',
    'goodbye': 'O dabọ',
    'how you dey?': 'Báwo ni?',
  },
  'en-pid': {
    'hello': 'how far',
    'how are you': 'How you dey?',
    'thank you': 'Thank you o',
    'good morning': 'Good morning o',
    'goodbye': 'See you later',
    'báwo ni?': 'How you dey?',
  },
  'yo-en': {
    'báwo': 'hello',
    'báwo ni?': 'how are you?',
    'e se': 'thank you',
    'e kaaro': 'good morning',
    'o dabọ': 'goodbye',
  },
  'pid-en': {
    'wetin dey happen': 'hello',
    'how you dey?': 'how are you?',
    'thank you o': 'thank you',
    'good morning o': 'good morning',
    'see you later': 'goodbye',
  },
  'yo-pid': {
    'báwo': 'Wetin dey happen',
    'báwo ni?': 'How you dey?',
    'e se': 'Thank you o',
    'e kaaro': 'Good morning o',
    'o dabọ': 'See you later',
  },
  'pid-yo': {
    'wetin dey happen': 'Báwo',
    'how you dey?': 'Báwo ni?',
    'thank you o': 'E se',
    'good morning o': 'E kaaro',
    'see you later': 'O dabọ',
  }
};

export const mockSTTAPI = async (audioBlob: Blob): Promise<ApiResponse<STTResponse>> => {
  await delay(1500);
  
  const mockTexts = [
    'How you dey?',
    'Báwo ni?',
    'Good morning o',
    'Thank you very much',
    'I wan go market'
  ];
  
  return {
    success: true,
    data: {
      text: mockTexts[Math.floor(Math.random() * mockTexts.length)]
    }
  };
};

export const mockMTAPI = async (
  text: string, 
  sourceLang: string, 
  targetLang: string
): Promise<ApiResponse<MTResponse>> => {
  await delay(1000);
  
  const langKey = `${sourceLang}-${targetLang}`;
  const translations = mockTranslations[langKey] || {};
  
  const textLower = text.toLowerCase().trim();
  let translatedText = translations[textLower];
  
  if (!translatedText) {
    const fallbackTranslations: Record<string, string> = {
      'en-yo': 'Ọrọ ti a ko mọ',
      'en-pid': 'Word wey I no sabi',
      'yo-en': 'Unknown word',
      'pid-en': 'Unknown word',
      'yo-pid': 'Word wey I no sabi',
      'pid-yo': 'Ọrọ ti a ko mọ'
    };
    translatedText = fallbackTranslations[langKey] || text;
  }
  
  return {
    success: true,
    data: {
      translatedText,
      confidenceScore: Math.random() * 0.3 + 0.7 // 0.7-1.0 range
    }
  };
};

export const mockTTSAPI = async (
  text: string, 
  language: string
): Promise<ApiResponse<TTSResponse>> => {
  await delay(800);
  
  // In a real app, this would return an actual audio URL
  // For now, we'll use a data URL or mock audio file
  return {
    success: true,
    data: {
      audioUrl: '/sample-audio.mp3' // This would be a real audio file in production
    }
  };
};