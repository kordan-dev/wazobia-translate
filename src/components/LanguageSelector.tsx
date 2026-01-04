import React from "react";
import { ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  isDarkMode: boolean;
}

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "pid", name: "Pidgin", flag: "🇳🇬" },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  setSourceLang,
  setTargetLang,
  isDarkMode,
}) => {
  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <label
          className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          From
        </label>
        <div className="relative">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className={`w-full p-3 pr-10 border rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      <button
        onClick={swapLanguages}
        className={`mt-7 p-2 rounded-full transition-colors duration-300 group ${
          isDarkMode
            ? "bg-gray-700 hover:bg-blue-800"
            : "bg-gray-100 hover:bg-blue-100"
        }`}
        title="Swap languages"
      >
        <svg
          className={`w-5 h-5 group-hover:text-blue-600 transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </button>

      <div className="flex-1">
        <label
          className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          To
        </label>
        <div className="relative">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className={`w-full p-3 pr-10 border rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-300 ${
              isDarkMode ? "text-gray-400" : "text-gray-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
