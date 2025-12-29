import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { 
  MessageCircle, Shield, Heart, Sparkles, Brain, 
  Clock, Lock, Zap, CheckCircle, Star, Users,
  ArrowRight, Send
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Landing = () => {
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thank you!", description: "Your feedback has been submitted." });
    setFeedback("");
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-border/40 backdrop-blur-md bg-background/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">{t('auth.login')}</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Get Started
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-Powered Mental Wellness Support • Available 24/7</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Your Safe Space for
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mental Wellness
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A compassionate AI companion powered by advanced technology that listens without judgment, 
              offering personalized support and evidence-based guidance whenever you need it most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 text-lg h-12">
                  Start Your Journey Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Private & Secure</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <Card className="border-2 hover:border-blue-500/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">24/7 Availability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access compassionate support anytime, anywhere. No appointments needed, just instant connection when you need it most.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-purple-500/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">100% Private & Secure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your conversations are completely confidential and encrypted. A judgment-free zone for your deepest thoughts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-pink-500/50 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced AI trained on therapeutic principles to provide empathetic, personalized responses tailored to you.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">How Serene Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple, effective, and designed with your mental wellness in mind
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-semibold mb-3">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Quick sign-up with email or phone number. No lengthy forms, just simple authentication to get started.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-semibold mb-3">Start Conversing</h3>
                <p className="text-muted-foreground">
                  Share what's on your mind. Our AI listens actively and responds with empathy, understanding, and practical guidance.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-semibold mb-3">Grow & Heal</h3>
                <p className="text-muted-foreground">
                  Track your progress, develop coping strategies, and build resilience with ongoing support tailored to your journey.
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Serene?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Evidence-based features designed to support your mental health
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: "Non-Judgmental Support", desc: "Share freely without fear of criticism or bias" },
                { icon: Zap, title: "Instant Response", desc: "Get immediate support when emotions are overwhelming" },
                { icon: MessageCircle, title: "Active Listening", desc: "AI trained to truly understand and validate your feelings" },
                { icon: Heart, title: "Emotional Intelligence", desc: "Empathetic responses that resonate with your experience" },
                { icon: Users, title: "Personalized Care", desc: "Adaptive AI that learns your unique needs over time" },
                { icon: CheckCircle, title: "Evidence-Based", desc: "Grounded in cognitive behavioral therapy principles" }
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4 p-6 rounded-xl bg-card border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Thousands</h2>
              <p className="text-xl text-muted-foreground">
                Real stories from real people finding support
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah M.", role: "College Student", text: "Serene has been a lifeline during stressful exam periods. It's like having a supportive friend available 24/7." },
                { name: "Michael R.", role: "Professional", text: "The privacy and instant availability make it perfect for managing work-related anxiety. Truly transformative." },
                { name: "Emma L.", role: "Healthcare Worker", text: "As a frontline worker, having access to mental health support anytime has been invaluable for my wellbeing." }
              ].map((testimonial, idx) => (
                <Card key={idx} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mb-24">
            <Card className="max-w-2xl mx-auto border-2">
              <CardContent className="pt-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2">Share Your Feedback</h2>
                  <p className="text-muted-foreground">
                    Help us improve Serene. Your thoughts matter to us.
                  </p>
                </div>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Tell us what you think about Serene..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    disabled={!feedback.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center py-16 px-6 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands who have found support, understanding, and growth with Serene
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-10 text-lg h-14">
                Get Started Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="mt-6 text-sm opacity-80">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-16 p-8 rounded-2xl bg-amber-500/5 border-2 border-amber-500/20">
            <p className="text-center text-muted-foreground leading-relaxed">
              <strong className="text-foreground block mb-2 text-lg">Important Medical Disclaimer</strong>
              Serene is a supportive wellness tool powered by AI technology and is not a substitute for professional mental health care, 
              therapy, or medical advice. If you're experiencing a mental health crisis, thoughts of self-harm, or suicidal ideation, 
              please contact emergency services immediately or reach out to a qualified mental health professional. 
              <br /><br />
              <strong>Crisis Resources:</strong> National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-12 mt-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Serene</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your trusted AI companion for mental wellness and emotional support.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/login" className="hover:text-foreground transition-colors">Features</Link></li>
                  <li><Link to="/signup" className="hover:text-foreground transition-colors">Pricing</Link></li>
                  <li><Link to="/chat" className="hover:text-foreground transition-colors">How It Works</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
              <p>© 2025 Serene. Built with ❤️ for mental wellness. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Landing;
