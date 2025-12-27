
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  content: string;
  role: "user" | "assistant";
  isLoading?: boolean;
};

export function ChatMessage({ content, role, isLoading }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <Avatar className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
          <span className="text-xs font-medium">AI</span>
        </Avatar>
      )}
      
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[80%] text-sm chat-animation-in shadow-sm",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted/80 backdrop-blur-sm",
          isLoading && "opacity-50"
        )}
      >
        {content}
      </div>
      
      {role === "user" && (
        <Avatar className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
          <span className="text-xs font-medium">You</span>
        </Avatar>
      )}
    </div>
  );
}
