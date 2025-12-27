
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
};

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSend(input);
    setInput("");
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-card/80 backdrop-blur-md p-4 border-t"
    >
      <Textarea
        placeholder="Type a message..."
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
