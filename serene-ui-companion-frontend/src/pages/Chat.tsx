import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatContainer } from "@/components/chat-container";
import { ChatHistory } from "@/components/chat-history";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Chat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSelectConversation = (id: number) => {
    setCurrentConversationId(id);
    setShowSidebar(false);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setShowSidebar(false);
  };

  return (
    <ThemeProvider>
      <div className="fixed inset-0 flex flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-2 md:px-8 md:py-4 border-b border-border bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <ChatHistory
                  currentConversationId={currentConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                />
              </SheetContent>
            </Sheet>

            <Link to="/dashboard" className="hidden md:block">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Serene_AI
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Your mental wellness companion</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 flex min-h-0">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-80">
            <ChatHistory
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />
          </div>
          
          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <ChatContainer 
              conversationId={currentConversationId}
              onConversationCreated={setCurrentConversationId}
            />
          </div>
        </main>

        <footer className="py-2 text-center text-xs text-muted-foreground bg-background/80 z-20">
          <p>This is a mental wellness assistant - not a replacement for professional help.</p>
          <p className="mt-1">If you're in crisis, please reach out to a mental health professional.</p>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Chat;
