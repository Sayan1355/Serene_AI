import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10" />
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">Last updated: December 29, 2024</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Our Commitment to Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At SERENE, we understand the sensitive nature of mental health conversations. 
              Your privacy and confidentiality are our highest priorities. This policy explains 
              how we collect, use, protect, and handle your personal information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Account Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Email address (for account creation and recovery)</li>
                <li>Name or username (optional)</li>
                <li>Password (encrypted and never stored in plain text)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Mental Wellness Data</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Chat conversations with our AI assistant</li>
                <li>Mood tracking entries and analytics</li>
                <li>Journal entries and personal notes</li>
                <li>Breathing exercise usage data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Technical Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Device type and browser information</li>
                <li>IP address and general location (city/country level)</li>
                <li>Usage statistics and feature interactions</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li>
                <strong>Provide Services:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  To deliver AI-powered mental health support, mood tracking, and journaling features.
                </p>
              </li>
              <li>
                <strong>Personalization:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  To understand your emotional patterns and provide tailored support and insights.
                </p>
              </li>
              <li>
                <strong>Safety & Crisis Detection:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  To identify potential crisis situations and provide emergency resources when needed.
                </p>
              </li>
              <li>
                <strong>Service Improvement:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  To analyze aggregate usage patterns and improve our AI models (anonymized data only).
                </p>
              </li>
              <li>
                <strong>Communication:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  To send important service updates, security alerts, and optional wellness reminders.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              How We Protect Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>End-to-end encryption for all data transmission (HTTPS/TLS)</li>
              <li>Passwords are hashed using industry-standard cryptographic algorithms</li>
              <li>Data stored in secure, encrypted databases</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication for all data access</li>
              <li>No sale or sharing of personal data with third parties</li>
              <li>HIPAA-compliant data handling practices (where applicable)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sharing & Third Parties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>We do NOT sell your personal data. Period.</strong>
            </p>
            
            <div>
              <h4 className="font-semibold mb-2">Limited Third-Party Services:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Google Gemini AI (for chat conversations - subject to Google's privacy policy)</li>
                <li>Cloud hosting providers (AWS/Render - with encryption at rest)</li>
                <li>Analytics tools (anonymized usage data only)</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              We may share anonymized, aggregated data for research purposes to advance 
              mental health understanding, but never in a way that could identify you.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights & Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li><strong>Access:</strong> Request a copy of all your personal data</li>
              <li><strong>Export:</strong> Download your mood, journal, and chat data in JSON format</li>
              <li><strong>Edit:</strong> Update or correct your account information</li>
              <li><strong>Delete:</strong> Permanently delete your account and all associated data</li>
              <li><strong>Opt-out:</strong> Disable notifications and analytics tracking</li>
              <li><strong>Restrict:</strong> Limit how we process your data</li>
            </ul>
            
            <p className="text-sm">
              To exercise these rights, visit your <strong>Settings</strong> page or contact us at{' '}
              <a href="mailto:privacy@serene-ai.com" className="text-primary hover:underline">
                privacy@serene-ai.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>Active accounts: Data retained indefinitely while account is active</li>
              <li>Inactive accounts: After 2 years of inactivity, we may archive or delete data</li>
              <li>Deleted accounts: Data permanently deleted within 30 days of deletion request</li>
              <li>Legal requirements: May retain certain data to comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy (COPPA Compliance)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              SERENE is not intended for users under the age of 13. We do not knowingly collect 
              personal information from children under 13. If you believe we have inadvertently 
              collected such data, please contact us immediately for deletion.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Users aged 13-17 should have parental consent before using our service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Legal Basis (GDPR & International Users)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For users in the European Union and other jurisdictions with data protection laws, 
              we process your data based on:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
              <li><strong>Consent:</strong> You explicitly agree to our data processing</li>
              <li><strong>Contract:</strong> Necessary to provide our services to you</li>
              <li><strong>Legitimate Interest:</strong> To improve our services and prevent abuse</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of significant 
              changes via email or a prominent notice on our platform. Your continued use of SERENE 
              after such changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">If you have questions about this privacy policy, please contact:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Email:</strong> privacy@serene-ai.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@serene-ai.com</p>
              <p><strong>Address:</strong> SERENE AI Inc., [Your Address]</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
