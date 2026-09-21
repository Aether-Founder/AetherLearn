'use client';

import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';

export default function TermsPageEN() {
  return (
    <AppShell>
      <PageHeader 
        title="Terms of Service" 
        description="Read our terms of service and usage guidelines" 
      />

      <div className="mt-10 max-w-4xl space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By using AetherLearn, you agree to these terms of service. 
            If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
          <p className="text-muted-foreground">
            To use certain features of AetherLearn, you must create an account. 
            You are responsible for maintaining the confidentiality of your account and password, 
            and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">User Content</h2>
          <p className="text-muted-foreground">
            You retain all rights to content you upload, share, or store in AetherLearn. 
            By uploading content, you grant AetherLearn a license to use, reproduce, and display 
            the content for the purpose of providing the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
          <p className="text-muted-foreground">
            It is prohibited to use AetherLearn for illegal purposes, 
            to infringe on the intellectual property rights of others, 
            or to distribute malware or harmful code.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="text-muted-foreground">
            AetherLearn reserves the right to terminate your account and access to the service 
            without prior notice, for any reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes</h2>
          <p className="text-muted-foreground">
            AetherLearn reserves the right to modify these terms at any time. 
            You are advised to review this page periodically for changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground mb-4">
            Have questions about these terms or business inquiries? Contact us.
          </p>
          <Link 
            href="https://docs.google.com/forms/d/PLACEHOLDER_ENGLISH_FORM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Business Inquiries
          </Link>
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
