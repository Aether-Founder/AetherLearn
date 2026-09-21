'use client';

import { AppShell, PageHeader } from '@/components/AppShell';

export default function PrivacyPageNL() {
  return (
    <AppShell>
      <PageHeader
        title="Privacybeleid"
        description="Lees hoe wij omgaan met je gegevens"
      />

      <div className="mt-10 max-w-4xl space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Informatie die wij verzamelen</h2>
          <p className="text-muted-foreground">
            Wij verzamelen informatie die je ons verstrekt bij het aanmaken van een account, 
            zoals je e-mailadres en gebruikersnaam. Wij verzamelen ook informatie over je gebruik 
            van de dienst, zoals studievoortgang en leerstatistieken.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Hoe wij deze informatie gebruiken</h2>
          <p className="text-muted-foreground">
            Wij gebruiken deze informatie om de dienst te leveren, te verbeteren en te personaliseren. 
            Wij gebruiken de informatie ook om je voortgang bij te houden en aanbevelingen te doen 
            op basis van je leerpatronen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gegevensbeveiliging</h2>
          <p className="text-muted-foreground">
            Wij nemen redelijke maatregelen om je gegevens te beschermen tegen ongeautoriseerde toegang, 
            wijziging of vernietiging. Jouw gegevens worden opgeslagen op beveiligde servers en worden 
            versleuteld tijdens de overdracht.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Jouw rechten</h2>
          <p className="text-muted-foreground">
            Je hebt het recht om toegang te krijgen tot, te corrigeren of te verwijderen van je persoonlijke 
            gegevens. Je kunt ook kiezen om marketingcommunicatie te ontvangen of niet te ontvangen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground">
            Heb je vragen over ons privacybeleid? Neem contact met ons op via support@aetherlearn.com.
          </p>
        </section>

        <section>
          <p className="text-sm text-muted-foreground">
            Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
