import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, TrendingUp, CheckCircle2, Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const GOAL_CATEGORIES = [
  { value: 'mood', label: '😊 Mood Improvement', icon: '😊' },
  { value: 'exercise', label: '🏃 Physical Activity', icon: '🏃' },
  { value: 'meditation', label: '🧘 Meditation', icon: '🧘' },
  { value: 'journal', label: '📝 Journaling', icon: '📝' },
  { value: 'social', label: '👥 Social Connection', icon: '👥' },
  { value: 'sleep', label: '😴 Sleep Quality', icon: '😴' },
  { value: 'therapy', label: '💬 Therapy Sessions', icon: '💬' },
  { value: 'other', label: '🎯 Other', icon: '🎯' },
];

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface GoalStats {
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  avg_progress: number;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mood');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('days');
  const [targetDate, setTargetDate] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [filterStatus]);

  const fetchGoals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const url = filterStatus === 'all' 
        ? 'http://localhost:8000/goals' 
        : `http://localhost:8000/goals?status=${filterStatus}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/goals/statistics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateGoal = async () => {
    if (!title || !targetValue || !targetDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch('http://localhost:8000/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          target_value: parseInt(targetValue),
          unit,
          target_date: targetDate,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Goal created! 🎯',
          description: 'Your new goal has been set. Let\'s achieve it!',
        });
        
        resetForm();
        setIsCreating(false);
        fetchGoals();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error creating goal',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProgress = async (goalId: number, newValue: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch(`http://localhost:8000/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_value: newValue }),
      });

      if (response.ok) {
        toast({
          title: 'Progress updated! 📈',
          description: 'Keep up the great work!',
        });
        
        fetchGoals();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error updating progress',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user.access_token;
      const response = await fetch(`http://localhost:8000/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: 'Goal deleted',
          description: 'The goal has been removed.',
        });
        
        fetchGoals();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: 'Error deleting goal',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('mood');
    setTargetValue('');
    setUnit('days');
    setTargetDate('');
  };

  const getCategoryIcon = (cat: string) => {
    return GOAL_CATEGORIES.find(c => c.value === cat)?.icon || '🎯';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-blue-500';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Target className="w-10 h-10" />
            Mental Health Goals
          </h1>
          <p className="text-muted-foreground">Set and track your wellness objectives</p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={resetForm}>
              <Plus className="w-5 h-5 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
              <DialogDescription>Set a mental health goal to work towards</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Meditate daily for 30 days"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Value *</label>
                  <Input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit *</label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="times">Times</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="sessions">Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Target Date *</label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateGoal} className="flex-1">
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total_goals}</div>
              <p className="text-xs text-muted-foreground">Total Goals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed_goals}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.active_goals}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.avg_progress}%</div>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All Goals
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('active')}
        >
          Active
        </Button>
        <Button
          variant={filterStatus === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    {goal.description && (
                      <CardDescription className="line-clamp-2">{goal.description}</CardDescription>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                      {goal.progress_percentage}%
                    </Badge>
                  </div>
                  <Progress value={goal.progress_percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </p>
                </div>

                {goal.status === 'active' && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Current value (max: ${goal.target_value})`}
                      max={goal.target_value}
                      min={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (value >= 0 && value <= goal.target_value) {
                            handleUpdateProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const value = parseInt(input.value);
                        if (value >= 0 && value <= goal.target_value) {
                          handleUpdateProgress(goal.id, value);
                          input.value = '';
                        }
                      }}
                    >
                      Update
                    </Button>
                  </div>
                )}

                {goal.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Completed on {new Date(goal.completed_at!).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                  <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                  <span>Started: {new Date(goal.start_date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your wellness journey by setting your first goal
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
