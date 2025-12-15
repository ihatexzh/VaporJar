import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RefreshCw, AudioWaveform } from 'lucide-react';
import { RetroButton } from './RetroUI';
import { playStartRecordSound, playStopRecordSound } from '../services/soundService';

interface AudioRecorderProps {
  onSave: (dataUri: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setPermission(true))
      .catch(() => setPermission(false));
  }, []);

  const startRecording = async () => {
    try {
      playStartRecordSound();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        chunksRef.current = [];
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onSave(reader.result);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    playStopRecordSound();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const reset = () => {
    setAudioUrl(null);
    onSave("");
  };

  if (!permission) {
    return <div className="text-rose-500 font-bold p-4 bg-rose-50 rounded-lg">Please enable microphone access 🎤</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8 w-full h-full">
      <div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-rose-50 shadow-[0_0_50px_rgba(251,113,133,0.4)]' : 'bg-gray-50 border border-gray-100'}`}>
        {isRecording && (
           <div className="absolute inset-0 rounded-full border-4 border-rose-300 animate-ping opacity-20"></div>
        )}
        
        {isRecording ? (
           <div className="flex gap-1 h-12 items-end justify-center">
              <div className="w-2 bg-rose-400 rounded-full animate-[bounce_1s_infinite]"></div>
              <div className="w-2 bg-rose-500 rounded-full animate-[bounce_1.2s_infinite]"></div>
              <div className="w-2 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
           </div>
        ) : audioUrl ? (
          <AudioWaveform size={64} className="text-purple-400" />
        ) : (
          <Mic size={64} className="text-gray-300" />
        )}
      </div>

      <div className="flex gap-4">
        {!isRecording && !audioUrl && (
          <RetroButton onClick={startRecording} variant="danger" className="rounded-full px-8 bg-rose-400 border-none text-white hover:bg-rose-500">
             Record
          </RetroButton>
        )}
        
        {isRecording && (
          <RetroButton onClick={stopRecording} className="bg-white border-rose-200 text-rose-500 hover:bg-rose-50 rounded-full px-8">
            <Square size={20} className="mr-2 inline fill-current" /> Stop
          </RetroButton>
        )}

        {audioUrl && (
          <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s]">
            <audio src={audioUrl} controls className="w-64 h-10 rounded-full shadow-sm" />
            <button onClick={reset} className="text-sm text-gray-400 hover:text-rose-500 flex items-center gap-1 transition-colors">
              <RefreshCw size={14} /> Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};