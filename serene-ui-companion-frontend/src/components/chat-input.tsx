
import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
            title: 'Voice input error',
            description: 'Could not capture voice input. Please try again.',
            variant: 'destructive',
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSend(input);
    setInput("");
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: 'Listening... 🎤',
        description: 'Speak now. Tap the mic again to stop.',
      });
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-card/80 backdrop-blur-md p-4 border-t"
    >
      <Textarea
        placeholder="Type a message or use voice input..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[60px] resize-none rounded-2xl border border-input focus-visible:ring-primary"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button
        type="button"
        size="icon"
        variant={isListening ? "destructive" : "outline"}
        onClick={toggleVoiceInput}
        disabled={isLoading}
        className="rounded-full h-10 w-10 shrink-0"
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      <Button 
        type="submit" 
        size="icon" 
        disabled={!input.trim() || isLoading}
        className="rounded-full h-10 w-10 shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
