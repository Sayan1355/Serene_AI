import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Phone, Heart, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedMessage?: string;
}

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself',
  'self-harm', 'cutting', 'overdose', 'worthless', 'no reason to live',
  'better off dead', 'hopeless', 'can\'t go on'
];

export function CrisisDetectionModal({ isOpen, onClose, detectedMessage }: CrisisModalProps) {
  const navigate = useNavigate();

  const handleEmergencyResources = () => {
    navigate('/emergency');
    onClose();
  };

  const handleCall988 = () => {
    window.location.href = 'tel:988';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl border-red-500 bg-red-50 dark:bg-red-950">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            <AlertDialogTitle className="text-2xl text-red-800 dark:text-red-200">
              We're Concerned About You
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4 text-base">
            <p className="text-red-700 dark:text-red-300 font-medium">
              It seems like you might be going through a very difficult time right now. 
              Your safety and well-being are extremely important.
            </p>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-red-300">
              <h4 className="font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Immediate Support Available 24/7
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900 rounded">
                  <div>
                    <p className="font-bold text-red-900 dark:text-red-100">988 Suicide & Crisis Lifeline</p>
                    <p className="text-sm text-red-700 dark:text-red-300">Free, confidential support 24/7</p>
                  </div>
                  <Button 
                    onClick={handleCall988}
                    size="lg"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call 988 Now
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900 rounded">
                  <div>
                    <p className="font-bold text-blue-900 dark:text-blue-100">Crisis Text Line</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Text HOME to 741741</p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = 'sms:741741&body=HOME'}
                    size="lg"
                    variant="outline"
                  >
                    Text Now
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                If you're in immediate danger:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200">
                <li>Call 911 or your local emergency services</li>
                <li>Go to the nearest emergency room</li>
                <li>Reach out to someone you trust immediately</li>
                <li>Remove any means of self-harm from your vicinity</li>
              </ul>
            </div>

            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
              <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">
                Right Now, You Can:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
                <li>Call or text a crisis helpline (they really want to help)</li>
                <li>Reach out to a friend or family member</li>
                <li>Practice grounding: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste</li>
                <li>Take a breathing exercise (we have guided ones available)</li>
                <li>Remember: These feelings are temporary, even when they don't feel like it</li>
              </ul>
            </div>

            <p className="text-center font-semibold text-red-800 dark:text-red-200 text-lg">
              You are not alone. Your life has value. Help is available.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            onClick={handleEmergencyResources}
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Phone className="w-5 h-5 mr-2" />
            View All Emergency Resources
          </Button>
          <Button
            onClick={() => navigate('/breathing')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Try Breathing Exercise
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto"
          >
            Continue Conversation
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function detectCrisisInMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export { CRISIS_KEYWORDS };
