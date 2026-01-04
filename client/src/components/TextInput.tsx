import React, { useRef } from "react";
import { Mic, MicOff } from "lucide-react";

// --- 1. Define Strict Interfaces (No 'any') ---

// Structure of the error event
interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// Structure of the SpeechRecognition instance
interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Structure of the Constructor
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend the Window interface to include the browser APIs
interface IWindow extends Window {
  SpeechRecognition?: ISpeechRecognitionConstructor;
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
}

// Structure of the Result Event
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}
// --------------------------------------------------

interface TextInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSpeechInput: (audioBlob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isDarkMode: boolean;
  sourceLang: string; // Added sourceLang to props
}

const TextInput: React.FC<TextInputProps> = ({
  inputText,
  setInputText,
  // onSpeechInput, // Unused in this mode
  isRecording,
  setIsRecording,
  isDarkMode,
  sourceLang, // Destructure sourceLang
}) => {
  // Use the specific interface instead of 'any'
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Helper to map app language codes to Web Speech API BCP-47 tags
  const getBrowserLangCode = (code: string): string => {
    // Normalize code to lower case just in case
    const normalized = code.toLowerCase();

    // Map based on what your LanguageSelector likely returns
    // Adjust these keys ('yo', 'pcm', etc) to match your actual state in App.tsx
    switch (normalized) {
      case "yo":
      case "yoruba":
        return "yo-NG"; // Yoruba (Nigeria)
      case "pcm":
      case "pidgin":
        return "en-NG"; // Fallback for Pidgin is Nigerian English
      case "en":
      case "english":
        return "en-US"; // Default English
      default:
        return "en-US";
    }
  };

  const startRecording = () => {
    // Cast window to our custom interface that includes SpeechRecognition
    const customWindow = window as unknown as IWindow;
    const SpeechRecognition =
      customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Your browser does not support Speech Recognition. Please try Chrome, Edge, or Safari."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    // DYNAMIC LANGUAGE SETTING
    // We use the helper function to set the correct language tag
    recognition.lang = getBrowserLangCode(sourceLang);
    console.log(`Starting recognition with language: ${recognition.lang}`);

    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInputText(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start recognition:", err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-md p-6 mb-6 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <label
        className={`block text-sm font-medium mb-3 transition-colors duration-300 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Enter text to translate
      </label>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or speak something to translate..."
        className={`w-full h-32 p-4 border rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
        }`}
        rows={4}
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={handleMicClick}
          className={`relative p-4 rounded-full transition-all duration-300 shadow-lg ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}

          {isRecording && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
          )}
        </button>
      </div>

      {isRecording && (
        <div className="text-center mt-2">
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? "text-red-400" : "text-red-600"
            }`}
          >
            Listening... Tap to stop
          </span>
        </div>
      )}
    </div>
  );
};

export default TextInput;
