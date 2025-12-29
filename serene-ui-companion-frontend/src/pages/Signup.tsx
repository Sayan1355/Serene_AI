import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Mail, Smartphone, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { signup, signupWithPhone } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password strength validation
  const validatePassword = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSendOtp = async (type: 'email' | 'phone') => {
    try {
      const response = await fetch('http://localhost:8000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'email' ? { email } : { phone })
      });

      if (response.ok) {
        setOtpSent(true);
        toast({ title: "OTP Sent!", description: `Check your ${type} for the verification code.` });
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    }
  };

  const handleVerifyOtp = async (type: 'email' | 'phone') => {
    setIsVerifyingOtp(true);
    try {
      const response = await fetch('http://localhost:8000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'email' ? { email, otp } : { phone, otp })
      });

      if (response.ok) {
        toast({ title: "Verified!", description: "OTP verified successfully" });
        // Proceed with signup
        if (type === 'email') {
          await handleEmailSignup();
        } else {
          await handlePhoneSignupWithVerifiedOtp();
        }
      } else {
        const error = await response.json();
        toast({ title: "Error", description: error.detail, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "OTP verification failed", variant: "destructive" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmailSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    try {
      await signup(name, email, password);
      toast({ title: "Account created!", description: "Welcome to Serene_AI." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create account", variant: "destructive" });
    }
  };

  const handlePhoneSignupWithVerifiedOtp = async () => {
    try {
      await signupWithPhone(name, phone);
      toast({ title: "Account created!", description: "Welcome to Serene_AI." });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create account", variant: "destructive" });
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <Link to="/" className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Start your wellness journey with Serene</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="space-y-1 text-xs mt-2">
                          <p className={passwordValidation.length ? "text-green-600 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                            {passwordValidation.length ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            At least 8 characters
                          </p>
                          <p className={passwordValidation.uppercase ? "text-green-600 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                            {passwordValidation.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            One uppercase letter
                          </p>
                          <p className={passwordValidation.lowercase ? "text-green-600 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                            {passwordValidation.lowercase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            One lowercase letter
                          </p>
                          <p className={passwordValidation.number ? "text-green-600 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                            {passwordValidation.number ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            One number
                          </p>
                          <p className={passwordValidation.special ? "text-green-600 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
                            {passwordValidation.special ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            One special character
                          </p>
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" disabled={password.length < 6}>
                      Create Account
                    </Button>
                  </form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button" onClick={() => toast({ title: "Coming Soon", description: "Google login will be available soon" })}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" onClick={() => toast({ title: "Coming Soon", description: "Facebook login will be available soon" })}>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="phone">
                  <form onSubmit={(e) => { e.preventDefault(); otpSent ? handleVerifyOtp('phone') : handleSendOtp('phone'); }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-phone">Full Name</Label>
                      <Input
                        id="name-phone"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={otpSent}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={otpSent}
                      />
                    </div>
                    
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          required
                        />
                        <Alert>
                          <AlertDescription className="text-xs">
                            OTP sent to your phone. Check your messages. Code expires in 5 minutes.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" disabled={isVerifyingOtp}>
                      {otpSent ? "Verify & Create Account" : "Send OTP"}
                    </Button>
                    
                    {otpSent && (
                      <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setOtpSent(false); setOtp(""); }}>
                        Change Phone Number
                      </Button>
                    )}
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Signup;
