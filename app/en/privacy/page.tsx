'use client';

import { AppShell, PageHeader } from '@/components/AppShell';

export default function PrivacyPageEN() {
  return (
    <AppShell>
      <PageHeader
        title="Privacy Policy"
        description="Learn how we handle your data"
      />

      <div className="mt-10 max-w-4xl space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide to us when creating an account, 
            such as your email address and username. We also collect information about your use 
            of the service, such as study progress and learning statistics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use This Information</h2>
          <p className="text-muted-foreground">
            We use this information to provide, improve, and personalize the service. 
            We also use the information to track your progress and make recommendations 
            based on your learning patterns.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-muted-foreground">
            We take reasonable measures to protect your data from unauthorized access, 
            alteration, or destruction. Your data is stored on secure servers and is 
            encrypted during transmission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-muted-foreground">
            You have the right to access, correct, or delete your personal data. 
            You can also choose to receive or not receive marketing communications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground">
            Have questions about our privacy policy? Contact us at support@aetherlearn.com.
          </p>
        </section>

        <section>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
