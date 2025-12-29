import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, BookOpen } from 'lucide-react';

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'];

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood_level: number;
  created_at: string;
  updated_at: string;
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodLevel, setMoodLevel] = useState<number>(3);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/journal', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleCreateEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both title and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          mood_level: moodLevel,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Journal entry created! ✍️',
          description: 'Your thoughts have been saved.',
        });
        
        resetForm();
        setIsCreating(false);
        fetchEntries();
      } else {
        throw new Error('Failed to create entry');
      }
    } catch (error) {
      toast({
        title: 'Error creating entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !title.trim() || !content.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch(`http://localhost:8000/journal/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          mood_level: moodLevel,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Entry updated! 📝',
          description: 'Your changes have been saved.',
        });
        
        resetForm();
        setEditingEntry(null);
        fetchEntries();
      } else {
        throw new Error('Failed to update entry');
      }
    } catch (error) {
      toast({
        title: 'Error updating entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch(`http://localhost:8000/journal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Entry deleted',
          description: 'The journal entry has been removed.',
        });
        
        fetchEntries();
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      toast({
        title: 'Error deleting entry',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMoodLevel(3);
  };

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMoodLevel(entry.mood_level);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10" />
            My Journal
          </h1>
          <p className="text-muted-foreground">Express your thoughts and feelings</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => resetForm()}>
              <PlusCircle className="w-5 h-5 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
              <DialogDescription>Write down your thoughts and feelings</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="flex gap-2">
                  {MOOD_EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setMoodLevel(index + 1)}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                        moodLevel === index + 1
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Let your thoughts flow..."
                  rows={12}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateEntry} className="flex-1">
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>Update your thoughts and feelings</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex gap-2">
                {MOOD_EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setMoodLevel(index + 1)}
                    className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                      moodLevel === index + 1
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Let your thoughts flow..."
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleUpdateEntry} className="flex-1">
                Update Entry
              </Button>
              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Entries List */}
      {entries.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="text-2xl">{MOOD_EMOJIS[entry.mood_level - 1]}</span>
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(entry)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your journal entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {entry.content}
                </p>
                {entry.updated_at !== entry.created_at && (
                  <Badge variant="secondary" className="mt-3">
                    Edited {new Date(entry.updated_at).toLocaleDateString()}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-6">
              Start journaling to track your thoughts and emotions
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
