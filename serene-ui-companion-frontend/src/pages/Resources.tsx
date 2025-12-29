import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Heart, Brain, Users, Lightbulb, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const copingStrategies = [
  {
    title: 'Grounding Techniques',
    icon: Brain,
    strategies: [
      {
        name: '5-4-3-2-1 Technique',
        description: 'Identify 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.',
        when: 'Use when feeling anxious or panicked',
      },
      {
        name: 'Box Breathing',
        description: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat.',
        when: 'Use when feeling stressed or overwhelmed',
      },
      {
        name: 'Physical Grounding',
        description: 'Press your feet firmly into the floor, hold ice cubes, or splash cold water on your face.',
        when: 'Use during dissociation or intense anxiety',
      },
    ],
  },
  {
    title: 'Emotional Regulation',
    icon: Heart,
    strategies: [
      {
        name: 'Name Your Emotions',
        description: 'Identify and label what you\'re feeling. "I feel anxious" or "I feel sad and frustrated."',
        when: 'Use when emotions feel overwhelming',
      },
      {
        name: 'Opposite Action',
        description: 'If your emotion doesn\'t fit the facts, do the opposite of what it urges you to do.',
        when: 'Use when emotions are unhelpful',
      },
      {
        name: 'Self-Soothing',
        description: 'Engage your five senses: listen to calming music, smell lavender, taste tea, touch soft fabric.',
        when: 'Use when needing comfort',
      },
    ],
  },
  {
    title: 'Cognitive Reframing',
    icon: Lightbulb,
    strategies: [
      {
        name: 'Challenge Negative Thoughts',
        description: 'Ask yourself: Is this thought true? Is there evidence? What would I tell a friend?',
        when: 'Use when spiraling into negative thinking',
      },
      {
        name: 'Perspective Taking',
        description: 'Consider alternative viewpoints. "What else could this mean?" or "Will this matter in 5 years?"',
        when: 'Use when stuck in one interpretation',
      },
      {
        name: 'Gratitude Practice',
        description: 'List 3 things you\'re grateful for, no matter how small.',
        when: 'Use daily or when feeling low',
      },
    ],
  },
];

const mentalHealthArticles = [
  {
    category: 'Understanding Mental Health',
    articles: [
      {
        title: 'What is Mental Health?',
        description: 'Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act.',
        link: 'https://www.mentalhealth.gov/basics/what-is-mental-health',
      },
      {
        title: 'Common Mental Health Conditions',
        description: 'Learn about anxiety, depression, PTSD, bipolar disorder, and other common conditions.',
        link: 'https://www.nimh.nih.gov/health/topics',
      },
      {
        title: 'The Importance of Self-Care',
        description: 'Self-care isn\'t selfish—it\'s essential for maintaining mental health and preventing burnout.',
        link: 'https://www.nami.org/Blogs/NAMI-Blog/December-2020/Self-Care-101',
      },
    ],
  },
  {
    category: 'Coping & Recovery',
    articles: [
      {
        title: 'Building Resilience',
        description: 'Resilience is the ability to adapt to stress and adversity. It can be learned and strengthened.',
        link: 'https://www.apa.org/topics/resilience',
      },
      {
        title: 'Managing Stress',
        description: 'Practical strategies for identifying stressors and developing healthy coping mechanisms.',
        link: 'https://www.helpguide.org/articles/stress/stress-management.htm',
      },
      {
        title: 'Sleep and Mental Health',
        description: 'The bidirectional relationship between sleep and mental health, plus tips for better sleep hygiene.',
        link: 'https://www.sleepfoundation.org/mental-health',
      },
    ],
  },
  {
    category: 'Treatment & Support',
    articles: [
      {
        title: 'Types of Therapy',
        description: 'Overview of CBT, DBT, psychodynamic therapy, and other evidence-based treatments.',
        link: 'https://www.psychologytoday.com/us/types-of-therapy',
      },
      {
        title: 'Medication Guide',
        description: 'Understanding psychiatric medications: antidepressants, mood stabilizers, and more.',
        link: 'https://www.nimh.nih.gov/health/topics/mental-health-medications',
      },
      {
        title: 'Finding Professional Help',
        description: 'How to find a therapist, what to expect in therapy, and questions to ask.',
        link: 'https://www.nami.org/Your-Journey/Individuals-with-Mental-Illness/Finding-a-Mental-Health-Professional',
      },
    ],
  },
];

const supportCommunities = [
  {
    name: 'NAMI (National Alliance on Mental Illness)',
    description: 'Support groups, education, and advocacy for individuals and families affected by mental illness.',
    link: 'https://www.nami.org/Support-Education',
  },
  {
    name: 'Mental Health America',
    description: 'Peer support, screening tools, and community resources.',
    link: 'https://www.mhanational.org/finding-help',
  },
  {
    name: 'The Trevor Project',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ youth.',
    link: 'https://www.thetrevorproject.org/',
  },
  {
    name: '7 Cups',
    description: 'Free, anonymous emotional support from trained listeners.',
    link: 'https://www.7cups.com/',
  },
  {
    name: 'r/mentalhealth (Reddit)',
    description: 'Peer support community for mental health discussions.',
    link: 'https://www.reddit.com/r/mentalhealth/',
  },
];

export default function Resources() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-10 h-10" />
          Mental Health Resources
        </h1>
        <p className="text-muted-foreground">
          Curated information, strategies, and support for your mental wellness journey
        </p>
      </div>

      <Tabs defaultValue="coping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coping">Coping Strategies</TabsTrigger>
          <TabsTrigger value="articles">Articles & Guides</TabsTrigger>
          <TabsTrigger value="support">Support Communities</TabsTrigger>
        </TabsList>

        {/* Coping Strategies Tab */}
        <TabsContent value="coping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence-Based Coping Techniques</CardTitle>
              <CardDescription>
                Practical strategies you can use right now to manage difficult emotions
              </CardDescription>
            </CardHeader>
          </Card>

          {copingStrategies.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.strategies.map((strategy, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{strategy.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {strategy.description}
                      </p>
                      <p className="text-xs italic text-muted-foreground">
                        💡 {strategy.when}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">In Crisis? Get Help Now</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you're experiencing a mental health emergency, immediate support is available.
                  </p>
                  <Link to="/emergency">
                    <Button variant="default">
                      View Emergency Resources
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-6">
          {mentalHealthArticles.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.articles.map((article, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-semibold mb-2">{article.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(article.link, '_blank')}
                    >
                      Read More →
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Recommended Books</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>📖 <strong>"The Body Keeps the Score"</strong> by Bessel van der Kolk - Trauma and healing</li>
                <li>📖 <strong>"Feeling Good"</strong> by David Burns - CBT for depression</li>
                <li>📖 <strong>"The Mindful Way Through Depression"</strong> by Williams et al. - Mindfulness-based approach</li>
                <li>📖 <strong>"Lost Connections"</strong> by Johann Hari - Understanding depression differently</li>
                <li>📖 <strong>"The Anxiety and Phobia Workbook"</strong> by Edmund Bourne - Practical exercises</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Communities Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Support Groups & Communities
              </CardTitle>
              <CardDescription>
                You're not alone. Connect with others who understand what you're going through.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportCommunities.map((community, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{community.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{community.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(community.link, '_blank')}
                  >
                    Visit Website →
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <div>
                    <strong>American Psychological Association (APA)</strong>
                    <p className="text-muted-foreground">Find licensed psychologists and evidence-based resources</p>
                    <a href="https://www.apa.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                      www.apa.org
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <div>
                    <strong>National Institute of Mental Health (NIMH)</strong>
                    <p className="text-muted-foreground">Research-based mental health information</p>
                    <a href="https://www.nimh.nih.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                      www.nimh.nih.gov
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <div>
                    <strong>Substance Abuse and Mental Health Services Administration (SAMHSA)</strong>
                    <p className="text-muted-foreground">Treatment locator and helpline: 1-800-662-4357</p>
                    <a href="https://www.samhsa.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                      www.samhsa.gov
                    </a>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Disclaimer</h4>
              <p className="text-sm text-muted-foreground">
                SERENE provides information and support, but is not a substitute for professional mental health care. 
                If you're experiencing severe symptoms, suicidal thoughts, or a mental health crisis, please seek 
                immediate help from a qualified mental health professional or call your local emergency services.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
