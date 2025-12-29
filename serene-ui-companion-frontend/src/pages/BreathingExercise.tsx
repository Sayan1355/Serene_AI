import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw } from 'lucide-react';

type ExerciseType = '478' | 'box' | 'deep';

const exercises = {
  '478': {
    name: '4-7-8 Breathing',
    description: 'A calming technique for relaxation and sleep',
    phases: [
      { action: 'Breathe In', duration: 4, instruction: 'Inhale through your nose' },
      { action: 'Hold', duration: 7, instruction: 'Hold your breath' },
      { action: 'Breathe Out', duration: 8, instruction: 'Exhale through your mouth' },
    ],
  },
  box: {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for stress management',
    phases: [
      { action: 'Breathe In', duration: 4, instruction: 'Inhale slowly' },
      { action: 'Hold', duration: 4, instruction: 'Hold your breath' },
      { action: 'Breathe Out', duration: 4, instruction: 'Exhale slowly' },
      { action: 'Hold', duration: 4, instruction: 'Hold empty' },
    ],
  },
  deep: {
    name: 'Deep Breathing',
    description: 'Simple and effective for immediate calm',
    phases: [
      { action: 'Breathe In', duration: 5, instruction: 'Inhale deeply' },
      { action: 'Hold', duration: 2, instruction: 'Hold briefly' },
      { action: 'Breathe Out', duration: 5, instruction: 'Exhale fully' },
    ],
  },
};

export default function BreathingExercise() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('478');
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const exercise = exercises[selectedExercise];
  const currentPhase = exercise.phases[currentPhaseIndex];

  useEffect(() => {
    if (!isActive) return;

    const totalDuration = currentPhase.duration;
    setCountdown(totalDuration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhaseIndex = (currentPhaseIndex + 1) % exercise.phases.length;
          setCurrentPhaseIndex(nextPhaseIndex);
          
          // Increment cycle count when completing a full cycle
          if (nextPhaseIndex === 0) {
            setCycleCount((c) => c + 1);
          }
          
          // Play sound
          playTransitionSound();
          
          return exercise.phases[nextPhaseIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhaseIndex, currentPhase.duration, exercise.phases]);

  const playTransitionSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = currentPhase.action === 'Breathe In' ? 440 : 330;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleStart = () => {
    setIsActive(true);
    setCountdown(currentPhase.duration);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setCountdown(0);
    setCycleCount(0);
  };

  const handleExerciseChange = (type: ExerciseType) => {
    setSelectedExercise(type);
    handleReset();
  };

  // Calculate animation scale
  const getCircleScale = () => {
    if (!isActive) return 1;
    
    const progress = 1 - (countdown / currentPhase.duration);
    
    if (currentPhase.action === 'Breathe In') {
      return 1 + (progress * 0.5); // Grow to 1.5x
    } else if (currentPhase.action === 'Breathe Out') {
      return 1.5 - (progress * 0.5); // Shrink back to 1x
    }
    return 1.5; // Hold at maximum
  };

  const getCircleColor = () => {
    switch (currentPhase.action) {
      case 'Breathe In':
        return 'bg-blue-500';
      case 'Breathe Out':
        return 'bg-green-500';
      case 'Hold':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Wind className="w-10 h-10" />
          Breathing Exercises
        </h1>
        <p className="text-muted-foreground">Calm your mind with guided breathing</p>
      </div>

      {/* Exercise Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(exercises) as ExerciseType[]).map((type) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedExercise === type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleExerciseChange(type)}
          >
            <CardHeader>
              <CardTitle>{exercises[type].name}</CardTitle>
              <CardDescription>{exercises[type].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                {exercises[type].phases.map((phase, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">{phase.action}:</span>
                    <span className="font-medium">{phase.duration}s</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breathing Visualization */}
      <Card className="mb-8">
        <CardContent className="pt-8">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            {/* Animated Circle */}
            <div className="relative mb-8">
              <div
                className={`w-64 h-64 rounded-full ${getCircleColor()} opacity-20 transition-all duration-1000 ease-in-out`}
                style={{
                  transform: `scale(${getCircleScale()})`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {isActive ? countdown : currentPhase.duration}
                  </div>
                  <div className="text-xl font-medium text-muted-foreground">
                    {currentPhase.action}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center mb-8">
              <p className="text-2xl font-medium mb-2">{currentPhase.instruction}</p>
              {cycleCount > 0 && (
                <p className="text-muted-foreground">
                  Completed {cycleCount} cycle{cycleCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              {!isActive ? (
                <Button size="lg" onClick={handleStart}>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button size="lg" onClick={handlePause} variant="secondary">
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button size="lg" onClick={handleReset} variant="outline">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Breathing Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Physical Benefits</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Reduces heart rate and blood pressure</li>
                <li>• Improves oxygen circulation</li>
                <li>• Relaxes muscle tension</li>
                <li>• Enhances immune system function</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Mental Benefits</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Reduces stress and anxiety</li>
                <li>• Improves focus and concentration</li>
                <li>• Promotes better sleep</li>
                <li>• Increases emotional regulation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
