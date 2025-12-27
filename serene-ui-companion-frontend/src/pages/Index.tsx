
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatContainer } from "@/components/chat-container";

const Index = () => {
  return (
    <ThemeProvider>
      <div className="fixed inset-0 flex flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-2 md:px-8 md:py-4 border-b border-border bg-background/80 backdrop-blur-md z-20">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Serene</h1>
            <p className="text-xs text-muted-foreground">Your mental health assistant</p>
          </div>
          <ThemeToggle />
        </header>

        {/* The chat container now takes full available space */}
        <main className="flex-1 flex flex-col min-h-0">
          <ChatContainer />
        </main>

        <footer className="py-2 text-center text-xs text-muted-foreground bg-background/80 z-20">
          <p>This is a mental health assistant demo - not a replacement for professional help.</p>
          <p className="mt-1">If you're in crisis, please reach out to a mental health professional.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
