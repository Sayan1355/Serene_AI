import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, TrendingUp, MessageSquare, BookOpen, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  mood: {
    average: number;
    total_entries: number;
    trend: 'up' | 'down' | 'stable';
  };
  journal: {
    total_entries: number;
    this_week: number;
  };
  chat: {
    total_conversations: number;
    total_messages: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);
  const [recentJournals, setRecentJournals] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.access_token;
      
      // Fetch mood analytics
      const moodResponse = await fetch('http://localhost:8000/mood/analytics?days=30', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const moodData = await moodResponse.json();

      // Fetch mood history
      const moodHistoryResponse = await fetch('http://localhost:8000/mood/history?days=7', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const moodHistoryData = await moodHistoryResponse.json();
      setRecentMoods(moodHistoryData.moods?.slice(0, 5) || []);

      // Fetch journal entries
      const journalResponse = await fetch('http://localhost:8000/journal?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const journalData = await journalResponse.json();
      setRecentJournals(journalData.entries || []);

      // Fetch conversations
      const conversationsResponse = await fetch('http://localhost:8000/conversations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const conversationsData = await conversationsResponse.json();

      // Calculate total messages
      let totalMessages = 0;
      for (const conv of conversationsData.conversations || []) {
        const messagesResponse = await fetch(`http://localhost:8000/conversations/${conv.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const messagesData = await messagesResponse.json();
        totalMessages += messagesData.messages?.length || 0;
      }

      setStats({
        mood: {
          average: moodData.average_mood || 0,
          total_entries: moodData.total_entries || 0,
          trend: 'stable',
        },
        journal: {
          total_entries: journalData.total || 0,
          this_week: journalData.entries?.filter((e: any) => {
            const entryDate = new Date(e.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate > weekAgo;
          }).length || 0,
        },
        chat: {
          total_conversations: conversationsData.conversations?.length || 0,
          total_messages: totalMessages,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getMoodEmoji = (level: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[level - 1] || '😐';
  };

  const getMoodLabel = (level: number) => {
    const labels = ['Very Bad', 'Bad', 'Okay', 'Good', 'Great'];
    return labels[level - 1] || 'Okay';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Friend'}! 👋</h1>
        <p className="text-muted-foreground">Here's your mental wellness overview</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getMoodEmoji(Math.round(stats.mood.average))}</span>
                <div>
                  <div className="text-2xl font-bold">{stats.mood.average.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.mood.total_entries} entries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.journal.total_entries}</div>
              <p className="text-xs text-muted-foreground">
                {stats.journal.this_week} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.chat.total_conversations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.chat.total_messages} messages
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Moods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Mood Entries</span>
              <Link to="/mood">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentMoods.length > 0 ? (
              <div className="space-y-3">
                {recentMoods.map((mood) => (
                  <div key={mood.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="text-2xl">{mood.mood_emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getMoodLabel(mood.mood_level)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mood.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {mood.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {mood.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No mood entries yet</p>
                <Link to="/mood">
                  <Button variant="outline" size="sm" className="mt-3">
                    Track Your Mood
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Journals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Journal Entries</span>
              <Link to="/journal">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentJournals.length > 0 ? (
              <div className="space-y-3">
                {recentJournals.map((journal) => (
                  <div key={journal.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getMoodEmoji(journal.mood_level)}</span>
                      <h4 className="font-medium text-sm flex-1 line-clamp-1">{journal.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {journal.content}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(journal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No journal entries yet</p>
                <Link to="/journal">
                  <Button variant="outline" size="sm" className="mt-3">
                    Start Journaling
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>What would you like to do today?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link to="/mood" className="block">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <Heart className="w-6 h-6" />
                <span>Track Mood</span>
              </Button>
            </Link>
            <Link to="/journal" className="block">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <BookOpen className="w-6 h-6" />
                <span>Write Journal</span>
              </Button>
            </Link>
            <Link to="/chat" className="block">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <MessageSquare className="w-6 h-6" />
                <span>Chat with AI</span>
              </Button>
            </Link>
            <Link to="/breathing" className="block">
              <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>Breathing Exercise</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
