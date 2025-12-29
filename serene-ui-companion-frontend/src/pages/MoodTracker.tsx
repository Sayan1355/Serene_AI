import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

const MOOD_LEVELS = [
  { level: 1, emoji: '😢', label: 'Very Bad', color: 'bg-red-500' },
  { level: 2, emoji: '😕', label: 'Bad', color: 'bg-orange-500' },
  { level: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500' },
  { level: 4, emoji: '🙂', label: 'Good', color: 'bg-green-500' },
  { level: 5, emoji: '😊', label: 'Great', color: 'bg-blue-500' },
];

interface MoodEntry {
  id: number;
  mood_level: number;
  mood_emoji: string;
  notes?: string;
  created_at: string;
}

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMoodHistory();
    fetchAnalytics();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/mood/history?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoodHistory(data.moods || []);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/mood/analytics?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmitMood = async () => {
    if (!selectedMood) {
      toast({
        title: 'Please select a mood',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const moodData = MOOD_LEVELS.find(m => m.level === selectedMood);
      
      const response = await fetch('http://localhost:8000/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood_level: selectedMood,
          mood_emoji: moodData?.emoji,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Mood logged successfully! 🎉',
          description: 'Keep tracking your emotional journey.',
        });
        
        setSelectedMood(null);
        setNotes('');
        fetchMoodHistory();
        fetchAnalytics();
      } else {
        throw new Error('Failed to log mood');
      }
    } catch (error) {
      toast({
        title: 'Error logging mood',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track your emotional well-being over time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Entry Card */}
        <Card>
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
            <CardDescription>Select your current mood</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-5 gap-3">
              {MOOD_LEVELS.map((mood) => (
                <button
                  key={mood.level}
                  onClick={() => setSelectedMood(mood.level)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.level
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-4xl mb-2">{mood.emoji}</span>
                  <span className="text-xs font-medium text-center">{mood.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind? How are you feeling?"
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSubmitMood}
              disabled={!selectedMood || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Logging...' : 'Log Mood'}
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Mood Analytics</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Average Mood</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">
                      {MOOD_LEVELS[Math.round(analytics.average_mood) - 1]?.emoji}
                    </span>
                    <Badge variant="secondary">
                      {analytics.average_mood.toFixed(1)}/5
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Total Entries</span>
                  <span className="text-2xl font-bold">{analytics.total_entries}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Tracking Period</span>
                  <span className="text-2xl font-bold">{analytics.period_days} days</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Start tracking your mood to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Mood Entries</CardTitle>
          <CardDescription>Your mood journey</CardDescription>
        </CardHeader>
        <CardContent>
          {moodHistory.length > 0 ? (
            <div className="space-y-3">
              {moodHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-3xl">{entry.mood_emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {MOOD_LEVELS[entry.mood_level - 1]?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No mood entries yet. Start tracking today!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
