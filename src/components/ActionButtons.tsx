import React from "react";
import { Languages, RotateCcw } from "lucide-react";

interface ActionButtonsProps {
  onTranslate: () => void;
  onClear: () => void;
  isLoading: boolean;
  canTranslate: boolean;
  isDarkMode: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTranslate,
  onClear,
  isLoading,
  canTranslate,
  isDarkMode,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={onTranslate}
        disabled={!canTranslate || isLoading}
        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
          canTranslate && !isLoading
            ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Languages className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Translating..." : "Translate"}
      </button>

      <button
        onClick={onClear}
        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
          isDarkMode
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        title="Clear all"
      >
        <RotateCcw className="w-5 h-5" />
        Clear
      </button>
    </div>
  );
};

export default ActionButtons;
