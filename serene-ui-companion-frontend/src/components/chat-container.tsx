
import { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
};

const INITIAL_GREETING = "Hi there, I'm Serene, your mental health assistant. How are you feeling today?";

interface ChatContainerProps {
  conversationId: number | null;
  onConversationCreated?: (id: number) => void;
}

export function ChatContainer({ conversationId, onConversationCreated }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 0, 
      role: "assistant", 
      content: INITIAL_GREETING
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      // Reset to initial greeting for new conversation
      setMessages([{ id: 0, role: "assistant", content: INITIAL_GREETING }]);
    }
  }, [conversationId]);

  const loadConversation = async (convId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`http://localhost:8000/conversations/${convId}`, {
        headers: {
          Authorization: `Bearer ${user.access_token || ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any, idx: number) => ({
          id: idx,
          role: msg.role,
          content: msg.content,
        })));
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  // Call the API and get assistant response
  const fetchAssistantResponse = async (userText: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token || ""}`,
        },
        body: JSON.stringify({ 
          text: userText,
          conversation_id: conversationId 
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // If this was a new conversation, update the parent
      if (!conversationId && data.conversation_id && onConversationCreated) {
        onConversationCreated(data.conversation_id);
      }
      
      return {
        response: typeof data.response === "string"
          ? data.response
          : "Sorry, I couldn't understand your message.",
        conversationId: data.conversation_id
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assistant response. Please try again.",
        variant: "destructive",
      });
      return {
        response: "Sorry, I'm having trouble connecting to my knowledge. Please try again later.",
        conversationId: null
      };
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message optimistically
    const userMessage = {
      id: messages.length,
      content,
      role: "user" as const
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Call API and add assistant message
    const result = await fetchAssistantResponse(content);

    const botMessage = {
      id: messages.length + 1,
      content: result.response,
      role: "assistant" as const
    };
    
    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  // Always scroll to bottom on new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 items-center">
      {/* Message area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 w-full max-w-3xl overflow-y-auto px-2 md:px-0 pb-4 md:pb-6 bg-background/70 backdrop-blur-lg"
        style={{ minHeight: 0 }}
      >
        <div className="flex flex-col gap-4 pt-2 md:pt-4 w-full">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              role={message.role}
            />
          ))}
          {isLoading && (
            <ChatMessage
              content="Thinking..."
              role="assistant"
              isLoading={true}
            />
          )}
        </div>
      </div>
      {/* Input fixed to the bottom */}
      <div className="sticky bottom-0 left-0 w-full max-w-3xl bg-background/95 backdrop-blur-xl z-10 border-t border-border">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
