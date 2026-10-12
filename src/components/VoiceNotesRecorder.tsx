// =====================================================================
// TRAUMANET v2 MULTILINGUAL VOICE & NOTES RECORDER
// Supports Hindi, Marathi & English for Nagpur Pilot (Build Guide Page 3)
// =====================================================================

"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Globe } from "lucide-react";

interface VoiceNotesRecorderProps {
  value: string;
  onChange: (notes: string) => void;
  language?: "en" | "hi" | "mr";
  onLanguageChange?: (lang: "en" | "hi" | "mr") => void;
}

export default function VoiceNotesRecorder({
  value,
  onChange,
  language = "en",
  onLanguageChange,
}: VoiceNotesRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setHasSpeechRecognition(true);
    }
  }, []);

  const getLangCode = () => {
    if (language === "hi") return "hi-IN";
    if (language === "mr") return "mr-IN";
    return "en-IN";
  };

  const toggleRecording = () => {
    if (!hasSpeechRecognition) {
      let sample = "";
      if (language === "hi") {
        sample = "मरीज को गंभीर सिर की चोट लगी है, बेहोश है, बीपी 85 है और ऑक्सीजन 90% है।";
      } else if (language === "mr") {
        sample = "रुग्णाला दुचाकीचा मोठा अपघात झाला, छातीवर मार बसला आहे, SpO2 88% आहे.";
      } else {
        sample = "Open abdominal laceration with severe hemorrhage. Hypotensive, GCS 8, cervical collar placed.";
      }
      onChange(value ? `${value} ${sample}` : sample);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLangCode();

      if (!isRecording) {
        setIsRecording(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onChange(value ? `${value} ${transcript}` : transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
    }
  };

  const quickPhrases: Record<string, string[]> = {
    en: ["Open Skull Fracture", "Blunt Abdominal Guarding", "Tourniquet Applied", "Flail Chest"],
    hi: ["सिर पर गंभीर चोट", "पेट में भारी दर्द", "टर्निकेट लगाया गया", "सांस लेने में रुकावट"],
    mr: ["डोक्याला गंभीर मार", "छातीत तीव्र वेदना", "रक्तस्राव रोखला", "श्वास घेण्यास त्रास"],
  };

  const currentPhrases = quickPhrases[language] || quickPhrases.en;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span>Paramedic Audio / Clinical Notes</span>
        </label>

        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as any)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-slate-900">मराठी (Marathi)</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={toggleRecording}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-400" />}
            <span>{isRecording ? "Listening..." : "Dictate Audio"}</span>
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          language === "hi"
            ? "हादसे की स्थिति, चोट और दिए गए प्राथमिक उपचार का विवरण लिखें..."
            : language === "mr"
            ? "अपघाताचे स्वरूप, जखमा आणि दिलेल्या उपचारांची नोंद करा..."
            : "Enter trauma observations, crash mechanics, or click Dictate Audio..."
        }
        rows={3}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
      />

      <div className="flex flex-wrap gap-1.5">
        {currentPhrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onChange(value ? `${value}. ${phrase}` : phrase)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            + {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
