import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Globe,
  Menu,
  X,
  Sun,
  Moon,
  Mic,
  MicOff,
  Copy,
  RotateCcw,
  Clock,
  AlertTriangle,
  Play,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";

// --- TYPES ---
export interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
  confidenceScore?: number;
}

interface TranslationResponse {
  originalText: string;
  translatedText: string;
  confidenceScore: number;
  targetLang: string;
}

// --- SPEECH RECOGNITION TYPES ---
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface IWindow extends Window {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
}

// API CONFIG
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// COMPONENTS

// LanguageSelector
interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  isDarkMode: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  setSourceLang,
  setTargetLang,
  isDarkMode,
}) => (
  <div
    className={`p-4 rounded-xl mb-6 flex items-center justify-between gap-4 ${
      isDarkMode ? "bg-gray-800" : "bg-white shadow-sm"
    }`}
  >
    <div className="flex-1">
      <label
        className={`block text-xs mb-1 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        From
      </label>
      <select
        value={sourceLang}
        onChange={(e) => setSourceLang(e.target.value)}
        className={`w-full p-2 rounded-lg border ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-50 border-gray-200 text-gray-800"
        }`}
      >
        <option value="en">English</option>
        <option value="yo">Yoruba</option>
        <option value="pcm">Pidgin</option>
      </select>
    </div>

    <div
      className={`mt-4 p-2 rounded-full ${
        isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"
      }`}
    >
      <span className="text-sm font-bold">→</span>
    </div>

    <div className="flex-1">
      <label
        className={`block text-xs mb-1 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        To
      </label>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className={`w-full p-2 rounded-lg border ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-gray-50 border-gray-200 text-gray-800"
        }`}
      >
        <option value="yo">Yoruba</option>
        <option value="pcm">Pidgin</option>
        <option value="en">English</option>
      </select>
    </div>
  </div>
);

// 2. TextInput
interface TextInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSpeechInput: (audioBlob: Blob) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isDarkMode: boolean;
  sourceLang: string;
}

const TextInput: React.FC<TextInputProps> = ({
  inputText,
  setInputText,
  isRecording,
  setIsRecording,
  isDarkMode,
  sourceLang,
}) => {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const startRecording = () => {
    const customWindow = window as unknown as IWindow;
    const SpeechRecognition =
      customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser not supported");
      return;
    }
    const recognition = new SpeechRecognition();
    const langMap: Record<string, string> = {
      en: "en-US",
      yo: "yo-NG",
      pcm: "en-NG",
    };
    recognition.lang = langMap[sourceLang] || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        final += event.results[i][0].transcript;
      }
      if (final) setInputText(final);
    };

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error("Speech recognition error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div
      className={`rounded-2xl shadow-md p-6 mb-6 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type or speak..."
        className={`w-full h-32 p-4 border rounded-xl resize-none bg-transparent ${
          isDarkMode
            ? "border-gray-600 text-white"
            : "border-gray-300 text-gray-800"
        }`}
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-4 rounded-full ${
            isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"
          }`}
        >
          {isRecording ? (
            <MicOff className="text-white" />
          ) : (
            <Mic className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

// 3. ActionButtons
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
}) => (
  <div className="flex gap-3 mb-6">
    <button
      onClick={onTranslate}
      disabled={!canTranslate || isLoading}
      className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all shadow-lg ${
        !canTranslate || isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      {isLoading ? "Translating..." : "Translate"}
    </button>
    <button
      onClick={onClear}
      className={`p-3 rounded-xl transition-colors border ${
        isDarkMode
          ? "border-gray-600 hover:bg-gray-700 text-gray-300"
          : "border-gray-200 hover:bg-gray-100 text-gray-600"
      }`}
    >
      <RotateCcw className="w-5 h-5" />
    </button>
  </div>
);

// 4. OutputDisplay
interface OutputDisplayProps {
  translatedText: string;
  confidenceScore?: number;
  isLoading: boolean;
  isDarkMode: boolean;
  onPlayAudio: () => void;
  isAudioLoading: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  translatedText,
  confidenceScore,
  isLoading,
  isDarkMode,
  onPlayAudio,
  isAudioLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl p-6 min-h-[160px] relative transition-colors ${
          isDarkMode ? "bg-gray-800" : "bg-white shadow-md"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3
            className={`text-sm font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Translation
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? "border-blue-400" : "border-blue-600"
              }`}
            ></div>
          </div>
        ) : translatedText ? (
          <>
            <p
              className={`text-lg leading-relaxed ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {translatedText}
            </p>

            {/* Action Buttons: Play & Copy */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {confidenceScore && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode
                      ? "bg-gray-700 text-green-400"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  AI Translated
                </span>
              )}

              {/* Play Button */}
              <button
                onClick={onPlayAudio}
                disabled={isAudioLoading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isDarkMode
                    ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100"
                }`}
                title="Play Audio"
              >
                {isAudioLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>Play</span>
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-colors ${
                  copied
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : isDarkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
                title="Copy Text"
              >
                {copied ? (
                  <span className="text-xs font-bold">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div
            className={`flex items-center justify-center h-24 ${
              isDarkMode ? "text-gray-600" : "text-gray-300"
            }`}
          >
            <p>Translation will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. ActivityLog (Updated with Clear History Button)
interface ActivityLogProps {
  translations: Translation[];
  onSelectTranslation: (translation: Translation) => void;
  onDownloadAudio: (translation: Translation) => void;
  onClearHistory: () => void;
  isDarkMode: boolean;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  translations,
  onSelectTranslation,
  onDownloadAudio,
  onClearHistory,
  isDarkMode,
}) => {
  if (translations.length === 0) {
    return (
      <div
        className={`rounded-2xl p-6 text-center ${
          isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
        }`}
      >
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent history</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div
        className={`p-4 border-b flex justify-between items-center ${
          isDarkMode ? "border-gray-700" : "border-gray-100"
        }`}
      >
        <h3
          className={`font-semibold flex items-center gap-2 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          <Clock className="w-4 h-4" /> Recent
        </h3>
        <button
          onClick={onClearHistory}
          className={`p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors`}
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {translations.map((item: Translation) => (
          <div
            key={item.id}
            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer`}
            onClick={() => onSelectTranslation(item)}
          >
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.sourceLang} → {item.targetLang}
                </span>
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {/* Ensure item.timestamp is a Date object before calling toLocaleTimeString */}
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p
                className={`text-sm truncate mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.sourceText}
              </p>
              <p
                className={`text-sm font-medium truncate ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {item.translatedText}
              </p>
            </div>

            {/* Download Button in History */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadAudio(item);
              }}
              className={`p-2 rounded-full opacity-100 transition-all ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title="Download Audio"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  // Language states
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("yo");

  // Input/Output states
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [confidenceScore, setConfidenceScore] = useState<number | undefined>();

  // UI states
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isServerReady, setIsServerReady] = useState<boolean | null>(null);

  // Activity log (loaded from local storage)
  const [translations, setTranslations] = useState<Translation[]>([]);

  // 1. Health Check
  useEffect(() => {
    fetch(`${SERVER_URL}/health`)
      .then((res) => {
        if (res.ok) {
          setIsServerReady(true);
        } else {
          setIsServerReady(false);
        }
      })
      .catch(() => {
        setIsServerReady(false);
      });
  }, []);

  // 2. Load History from Local Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("translation_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // JSON stores dates as strings, so we convert them back to Date objects
        const hydrated = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setTranslations(hydrated);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Helper: Save to Local Storage
  const saveToHistory = (newItem: Translation) => {
    setTranslations((prev) => {
      const updated = [newItem, ...prev].slice(0, 7); // Limit to 7 items
      localStorage.setItem("translation_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Helper: Clear History
  const clearHistory = () => {
    setTranslations([]);
    localStorage.removeItem("translation_history");
  };

  // Speech Input (using Web Speech API)
  const handleSpeechInput = useCallback((audioBlob: Blob) => {
    console.log("Audio blob received", audioBlob);
  }, []);

  // Handle Translate (Connects to Backend)
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setTranslatedText("");
    setConfidenceScore(undefined);

    try {
      // Connect to Real Backend
      const response = await fetch(`${SERVER_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          source: sourceLang,
          target: targetLang,
        }),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data: TranslationResponse = await response.json();

      setTranslatedText(data.translatedText);
      setConfidenceScore(data.confidenceScore);

      // Add to history (using local storage helper)
      const newTranslation: Translation = {
        id: Date.now().toString(),
        sourceText: inputText,
        translatedText: data.translatedText,
        sourceLang,
        targetLang,
        timestamp: new Date(),
        confidenceScore: data.confidenceScore,
      };

      saveToHistory(newTranslation);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText(
        "Error: Could not connect to translation server. Make sure you are running 'node server/index.js' on port 5000."
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  // --- TTS Handler ---
  const generateAudio = useCallback(
    async (text: string, lang: string, action: "play" | "download") => {
      if (!text) return;

      setIsAudioLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lang }),
        });

        if (!response.ok) throw new Error("TTS Generation failed");

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        if (action === "play") {
          const audio = new Audio(audioUrl);
          audio.play();
        } else if (action === "download") {
          const link = document.createElement("a");
          link.href = audioUrl;
          link.download = `translation-${Date.now()}.wav`; // Download as WAV
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error("Audio error:", error);
        alert("Failed to generate audio. Please check server.");
      } finally {
        setIsAudioLoading(false);
      }
    },
    []
  );

  const handleClear = useCallback(() => {
    setInputText("");
    setTranslatedText("");
    setConfidenceScore(undefined);
  }, []);

  const handleSelectTranslation = useCallback((translation: Translation) => {
    setInputText(translation.sourceText);
    setTranslatedText(translation.translatedText);
    setConfidenceScore(translation.confidenceScore);
    setSourceLang(translation.sourceLang);
    setTargetLang(translation.targetLang);
    setShowActivityLog(false);
  }, []);

  const canTranslate = inputText.trim().length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* Header */}
      <header
        className={`shadow-sm border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                WaZoBia Translate
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`hidden sm:inline text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {sourceLang === "en"
                  ? "English"
                  : sourceLang === "yo"
                  ? "Yoruba"
                  : "Pidgin"}
              </span>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                }`}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowActivityLog(!showActivityLog)}
                className={`p-2 rounded-lg transition-all duration-300 lg:hidden ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                }`}
              >
                {showActivityLog ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* SERVER HEALTH WARNING */}
      {isServerReady === false && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Backend Server is disconnected. Please run 'node server/index.js'
              in your terminal.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="max-w-2xl mx-auto">
              <LanguageSelector
                sourceLang={sourceLang}
                targetLang={targetLang}
                setSourceLang={setSourceLang}
                setTargetLang={setTargetLang}
                isDarkMode={isDarkMode}
              />

              <TextInput
                inputText={inputText}
                setInputText={setInputText}
                onSpeechInput={handleSpeechInput}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                isDarkMode={isDarkMode}
                sourceLang={sourceLang}
              />

              <ActionButtons
                onTranslate={handleTranslate}
                onClear={handleClear}
                isLoading={isLoading}
                canTranslate={canTranslate}
                isDarkMode={isDarkMode}
              />

              <OutputDisplay
                translatedText={translatedText}
                confidenceScore={confidenceScore}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
                onPlayAudio={() =>
                  generateAudio(translatedText, targetLang, "play")
                }
                isAudioLoading={isAudioLoading}
              />
            </div>
          </div>

          {/* Activity Log - Desktop Sidebar */}
          <div className="hidden lg:block">
            <ActivityLog
              translations={translations}
              onSelectTranslation={handleSelectTranslation}
              onDownloadAudio={(item) =>
                generateAudio(item.translatedText, item.targetLang, "download")
              }
              onClearHistory={clearHistory}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Activity Log - Mobile Overlay */}
          {showActivityLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div
                className={`absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto transition-colors duration-300 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      History
                    </h3>
                    <button
                      onClick={() => setShowActivityLog(false)}
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ActivityLog
                    translations={translations}
                    onSelectTranslation={handleSelectTranslation}
                    onDownloadAudio={(item) =>
                      generateAudio(
                        item.translatedText,
                        item.targetLang,
                        "download"
                      )
                    }
                    onClearHistory={clearHistory}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
