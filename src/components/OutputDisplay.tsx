import React, { useState } from "react";
import { Copy, Volume2, CheckCircle } from "lucide-react";

interface OutputDisplayProps {
  translatedText: string;
  confidenceScore?: number;
  audioUrl?: string;
  isLoading: boolean;
  isDarkMode: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  translatedText,
  confidenceScore,
  audioUrl,
  isLoading,
  isDarkMode,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      audio.play().catch(() => setIsPlaying(false));
    } else {
      // Mock audio playback
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-md p-6 mb-6 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <label
          className={`block text-sm font-medium transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Translation
        </label>
        {confidenceScore && (
          <span
            className={`text-xs transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Confidence: {Math.round(confidenceScore * 100)}%
          </span>
        )}
      </div>

      <div
        className={`min-h-32 p-4 rounded-xl border mb-4 relative transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-700 border-gray-600"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span
              className={`ml-3 transition-colors duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Translating...
            </span>
          </div>
        ) : translatedText ? (
          <p
            className={`text-lg leading-relaxed transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {translatedText}
          </p>
        ) : (
          <p
            className={`text-center py-8 transition-colors duration-300 ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Translation will appear here...
          </p>
        )}
      </div>

      {translatedText && !isLoading && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title="Copy translation"
          >
            {isCopied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy
                className={`w-4 h-4 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
            )}
            <span className="text-sm">{isCopied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={playAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isPlaying
                ? "bg-blue-100 text-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            title="Play translation"
            disabled={isPlaying}
          >
            <Volume2
              className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`}
            />
            <span className="text-sm">{isPlaying ? "Playing..." : "Play"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;
