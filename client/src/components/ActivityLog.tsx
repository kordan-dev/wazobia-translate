import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { Translation } from "../types";

interface ActivityLogProps {
  translations: Translation[];
  onSelectTranslation?: (translation: Translation) => void;
  isDarkMode: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  translations,
  onSelectTranslation,
  isDarkMode,
}) => {
  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      en: "English",
      yo: "Yorùbá",
      pid: "Pidgin",
    };
    return names[code] || code;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (translations.length === 0) {
    return (
      <div
        className={`rounded-2xl shadow-md p-6 transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock
            className={`w-5 h-5 transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          />
          <h3
            className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Recent Translations
          </h3>
        </div>
        <p
          className={`text-center py-8 transition-colors duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          No translations yet. Start translating to see your history!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl shadow-md p-6 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock
          className={`w-5 h-5 transition-colors duration-300 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        />
        <h3
          className={`text-lg font-semibold transition-colors duration-300 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Recent Translations
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {translations.map((translation) => (
          <div
            key={translation.id}
            className={`p-4 rounded-lg transition-colors duration-300 cursor-pointer ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => onSelectTranslation?.(translation)}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <span>{getLanguageName(translation.sourceLang)}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{getLanguageName(translation.targetLang)}</span>
              </div>
              <span
                className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {formatTime(translation.timestamp)}
              </span>
            </div>

            <div className="space-y-2">
              <p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                "{translation.sourceText}"
              </p>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                }`}
              >
                "{translation.translatedText}"
              </p>
            </div>

            {translation.confidenceScore && (
              <div className="mt-2 flex justify-end">
                <span
                  className={`text-xs transition-colors duration-300 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {Math.round(translation.confidenceScore * 100)}% confidence
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
