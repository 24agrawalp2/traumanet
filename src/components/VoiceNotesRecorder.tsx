"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

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
      const sampleNotes = [
        "Patient trapped under crushed vehicle dashboard. Suspected blunt abdominal trauma and flail chest. Airway maintained on high flow oxygen.",
        "Unresponsive male with open temporal skull fracture and pupillary asymmetry. GCS 7. Massive external hemorrhage controlled with pressure dressing.",
        "Heavy machinery crush injury right lower extremity. Pulses absent distal to knee, tourniquet applied.",
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

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch (e) {
      setIsRecording(false);
    }
  };

  const quickPhrases = [
    "Flail Chest",
    "Open Skull Fracture",
    "Blunt Abdominal Guarding",
    "Tourniquet Applied",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <span>Paramedic Audio / Clinical Notes</span>
        </label>
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

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter internal trauma observations, crash mechanics, or click Dictate..."
        rows={3}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
      />

      <div className="flex flex-wrap gap-2">
        {quickPhrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onChange(value ? `${value}. ${phrase}` : phrase)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            + {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
