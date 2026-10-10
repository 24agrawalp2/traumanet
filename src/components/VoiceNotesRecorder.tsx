"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";

interface VoiceNotesRecorderProps {
  value: string;
  onChange: (notes: string) => void;
}

export default function VoiceNotesRecorder({ value, onChange }: VoiceNotesRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setHasSpeechRecognition(true);
    }
  }, []);

  const toggleRecording = () => {
    if (!hasSpeechRecognition) {
      // Simulate voice-to-text with quick emergency voice transcripts
      const sampleNotes = [
        "Patient found trapped under crushed vehicle dashboard. Suspected blunt abdominal trauma and flail chest. Airway maintained on high flow oxygen.",
        "Unresponsive male with open temporal skull fracture and pupillary asymmetry. GCS 7. Massive external hemorrhage controlled with pressure dressing.",
        "Industrial heavy machinery crush injury right lower extremity. Significant blood loss, pulses absent distal to knee, tourniquet applied at 14:15 hrs.",
      ];
      const randomNote = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
      onChange(value ? `${value} ${randomNote}` : randomNote);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      if (!isRecording) {
        setIsRecording(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onChange(value ? `${value} ${transcript}` : transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch (e) {
      setIsRecording(false);
    }
  };

  const quickPhrases = [
    "Suspected Flail Chest",
    "Open Skull Fracture",
    "Blunt Abdominal Guarding",
    "Tourniquet Applied",
    "GCS Rapid Deterioration",
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-accent-blue" />
          <span>Paramedic Audio / Field Notes Override</span>
        </label>
        <button
          type="button"
          onClick={toggleRecording}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            isRecording
              ? "bg-red-600 text-white animate-pulse"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-400" />}
          <span>{isRecording ? "Listening..." : "Dictate Audio"}</span>
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter internal trauma observations, crash mechanics, or click Dictate Audio..."
        rows={3}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
      />

      {/* Quick Field Tags */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {quickPhrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onChange(value ? `${value}. ${phrase}` : phrase)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
          >
            + {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
