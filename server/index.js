const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LOCAL_TTS_API_KEY = process.env.LOCAL_TTS_API_KEY;

// --- HELPERS ---
function createWavHeader(sampleRate, numChannels, bitsPerSample, dataLength) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in .env");
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
}

// --- ROUTES ---

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

//STT (Speech to Text)
const upload = multer({ storage: multer.memoryStorage() });
app.post("/api/stt", upload.single("audio"), async (req, res) => {
  res.json({
    text: "Mock STT response. Connect Whisper or use Frontend Web Speech API.",
  });
});

// SMART TRANSLATE
app.post("/api/translate", async (req, res) => {
  const { text, source, target } = req.body;
  const langMap = {
    en: "English",
    yo: "Yoruba",
    pcm: "Nigerian Pidgin",
    pidgin: "Nigerian Pidgin",
  };

  const prompt = `Translate the following text strictly from ${
    langMap[source] || source
  } to ${langMap[target] || target}. 
  Do not add explanations. Text: "${text}"`;

  try {
    const translatedText = await callGemini(prompt);
    res.json({
      originalText: text,
      translatedText: translatedText.trim(),
      confidenceScore: 0.95,
      targetLang: target,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Translation failed", details: error.message });
  }
});

// text to speech with nigerian accent logic
app.post("/api/tts", async (req, res) => {
  const { text, lang } = req.body;

  // Use Specialized TTS for Pidgin/Yoruba if Key exists, otherwise fallback to Gemini
  if ((lang === "pcm" || lang === "yo" || lang === "en") && LOCAL_TTS_API_KEY) {
    try {
      console.log(`Attempting Localized TTS for ${lang}...`);
      const response = await axios.post(
        "https://yarngpt.ai/api/v1/tts",
        {
          text: text,
          voice: "Idera", // yarngpt voice ID
        },
        {
          headers: { Authorization: `Bearer ${LOCAL_TTS_API_KEY}` },
          responseType: "arraybuffer", // important for audio files
        }
      );

      res.set({
        "Content-Type": "audio/wav",
        "Content-Length": response.data.length,
      });
      return res.send(response.data);
    } catch (localError) {
      console.warn(
        "Localized TTS failed, falling back to Gemini:",
        localError.message
      );
      // Fallthrough to Gemini...
    }
  }

  // Gemini TTS Fallback
  const voiceName = "Kore";
  const TTS_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName,
          },
        },
      },
    },
  };

  try {
    const response = await axios.post(TTS_URL, payload);

    const base64Audio =
      response.data.candidates[0].content.parts[0].inlineData.data;
    const pcmBuffer = Buffer.from(base64Audio, "base64");

    // Gemini Config: 24kHz, 1 channel, 16 bit
    const wavHeader = createWavHeader(24000, 1, 16, pcmBuffer.length);
    const wavBuffer = Buffer.concat([wavHeader, pcmBuffer]);

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": wavBuffer.length,
    });
    res.send(wavBuffer);
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Text-to-Speech generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
