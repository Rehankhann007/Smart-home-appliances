import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
}

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  supported: boolean;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

export default function useSpeechRecognition({
  onResult,
  onEnd,
  onError,
  autoStart = false,
  continuous = true,
}: UseSpeechRecognitionProps = {}): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const createRecognition = useCallback(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      return null;
    }

    const instance: SpeechRecognition = new SpeechRecognition();
    instance.continuous = continuous;
    instance.interimResults = true;
    instance.lang = "en-US"; // You can dynamically change this if needed

    instance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        setTranscript(""); 
        onResult?.(finalTranscript.trim());
      } else {
        setTranscript(interimTranscript);
      }
    };

    instance.onend = () => {
      if (isListening) {
        instance.start(); 
      }
      onEnd?.();
    };

    instance.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      onError?.(event.error);
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}. Try again.`,
        variant: "destructive",
      });
    };

    return instance;
  }, [SpeechRecognition, continuous, isListening, onResult, onEnd, onError, toast]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
    }

    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (error) {
      console.error("Speech recognition start error:", error);
    }
  }, [SpeechRecognition, createRecognition, toast]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (autoStart) {
      startListening();
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, [autoStart, startListening]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    supported,
  };
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}
