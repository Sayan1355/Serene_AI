import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, Heart, AlertCircle, Globe, MessageCircle } from 'lucide-react';

const emergencyHelplines = [
  {
    country: 'United States',
    helplines: [
      { name: '988 Suicide & Crisis Lifeline', number: '988', description: '24/7 free and confidential support' },
      { name: 'Crisis Text Line', number: 'Text HOME to 741741', description: 'Text-based crisis support' },
      { name: 'SAMHSA National Helpline', number: '1-800-662-4357', description: 'Mental health and substance abuse' },
      { name: 'Veterans Crisis Line', number: '988 then press 1', description: 'Support for veterans and families' },
    ],
  },
  {
    country: 'India',
    helplines: [
      { name: 'AASRA', number: '91-9820466726', description: '24/7 crisis helpline' },
      { name: 'Vandrevala Foundation', number: '1860-2662-345', description: 'Mental health support' },
      { name: 'iCall', number: '9152987821', description: 'Psychosocial helpline' },
      { name: 'Snehi', number: '91-22-27546669', description: 'Emotional support' },
    ],
  },
  {
    country: 'United Kingdom',
    helplines: [
      { name: 'Samaritans', number: '116 123', description: '24/7 listening service' },
      { name: 'Papyrus HOPELINEUK', number: '0800 068 4141', description: 'Under 35s in crisis' },
      { name: 'Mind Infoline', number: '0300 123 3393', description: 'Mental health information' },
      { name: 'Shout Crisis Text Line', number: 'Text SHOUT to 85258', description: 'Text-based support' },
    ],
  },
  {
    country: 'Canada',
    helplines: [
      { name: 'Talk Suicide Canada', number: '1-833-456-4566', description: '24/7 crisis support' },
      { name: 'Crisis Services Canada', number: '1-833-456-4566', description: 'Text 45645 for text support' },
      { name: 'Kids Help Phone', number: '1-800-668-6868', description: 'Support for youth' },
    ],
  },
  {
    country: 'Australia',
    helplines: [
      { name: 'Lifeline', number: '13 11 14', description: '24/7 crisis support' },
      { name: 'Beyond Blue', number: '1300 22 4636', description: 'Depression and anxiety support' },
      { name: 'Suicide Call Back Service', number: '1300 659 467', description: 'Professional counseling' },
    ],
  },
];

const copingStrategies = [
  {
    title: 'If you\'re in immediate danger',
    icon: AlertCircle,
    color: 'text-red-500',
    strategies: [
      'Call emergency services (911, 112, 999) immediately',
      'Go to the nearest emergency room',
      'Stay with someone you trust',
      'Remove any means of self-harm from your vicinity',
    ],
  },
  {
    title: 'Grounding Techniques',
    icon: Heart,
    color: 'text-blue-500',
    strategies: [
      '5-4-3-2-1: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
      'Focus on your breathing - breathe in for 4, hold for 4, out for 4',
      'Place your feet firmly on the ground and notice the sensation',
      'Hold ice cubes or splash cold water on your face',
    ],
  },
  {
    title: 'Immediate Actions',
    icon: Phone,
    color: 'text-green-500',
    strategies: [
      'Reach out to a trusted friend or family member',
      'Use a crisis text line if talking feels too difficult',
      'Write down your feelings in a journal',
      'Engage in physical activity - walk, stretch, exercise',
    ],
  },
];

export default function EmergencyResources() {
  const handleCall = (number: string) => {
    // Remove text instructions for actual phone numbers
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    if (cleanNumber) {
      window.location.href = `tel:${cleanNumber}`;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Critical Alert */}
      <Alert className="mb-8 border-red-500 bg-red-50 dark:bg-red-950">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        <AlertTitle className="text-red-800 dark:text-red-200 text-lg font-bold">
          If you're experiencing a mental health emergency
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          You are not alone. Help is available 24/7. If you're in immediate danger, please call emergency services or go to your nearest emergency room.
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Emergency Resources</h1>
        <p className="text-muted-foreground">Immediate support when you need it most</p>
      </div>

      {/* Crisis Helplines by Country */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="w-6 h-6" />
          Crisis Helplines
        </h2>
        
        {emergencyHelplines.map((region) => (
          <Card key={region.country}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {region.country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {region.helplines.map((helpline) => (
                  <div
                    key={helpline.name}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-semibold mb-1">{helpline.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{helpline.description}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleCall(helpline.number)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {helpline.number}
                      </Button>
                      {helpline.number.includes('Text') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const sms = helpline.number.match(/(\d+)/)?.[0];
                            if (sms) window.location.href = `sms:${sms}`;
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coping Strategies */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Immediate Coping Strategies</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {copingStrategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <Card key={strategy.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${strategy.color}`} />
                    {strategy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strategy.strategies.map((item, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Safety Planning */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Create a Safety Plan</CardTitle>
          <CardDescription>
            Having a plan can help you stay safe during a crisis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Warning Signs</h4>
            <p className="text-sm text-muted-foreground">
              Identify thoughts, feelings, or situations that might lead to a crisis
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Internal Coping Strategies</h4>
            <p className="text-sm text-muted-foreground">
              Activities you can do on your own (exercise, journaling, meditation)
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. People to Contact</h4>
            <p className="text-sm text-muted-foreground">
              Friends, family, or professionals who can help
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Make Your Environment Safe</h4>
            <p className="text-sm text-muted-foreground">
              Remove or secure items that could be used for self-harm
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">5. Crisis Contacts</h4>
            <p className="text-sm text-muted-foreground">
              Keep helpline numbers readily available and saved in your phone
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Alert className="mt-8">
        <Heart className="h-5 w-5" />
        <AlertTitle>You Matter</AlertTitle>
        <AlertDescription>
          Your life has value and meaning. These difficult feelings are temporary, and with support, things can get better. 
          Please reach out - there are people who want to help you through this.
        </AlertDescription>
      </Alert>
    </div>
  );
}
