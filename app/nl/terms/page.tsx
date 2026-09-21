'use client';

import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';

export default function TermsPageNL() {
  return (
    <AppShell>
      <PageHeader 
        title="Algemene Voorwaarden" 
        description="Lees onze algemene voorwaarden en gebruiksaanwijzingen" 
      />

      <div className="mt-10 max-w-4xl space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Acceptatie van Voorwaarden</h2>
          <p className="text-muted-foreground">
            Door gebruik te maken van AetherLearn ga je akkoord met deze algemene voorwaarden. 
            Als je niet akkoord gaat met deze voorwaarden, mag je de dienst niet gebruiken.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gebruikersaccounts</h2>
          <p className="text-muted-foreground">
            Om bepaalde functies van AetherLearn te gebruiken, moet je een account aanmaken. 
            Je bent verantwoordelijk voor het bewaren van de vertrouwelijkheid van je account en wachtwoord, 
            en voor alle activiteiten die plaatsvinden onder je account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Gebruikersinhoud</h2>
          <p className="text-muted-foreground">
            Je behoudt alle rechten op inhoud die je uploadt, deelt of opslaat in AetherLearn. 
            Door inhoud te uploaden, geef je AetherLearn een licentie om de inhoud te gebruiken, 
            te reproduceren en weer te geven voor het leveren van de dienst.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Verboden Gebruik</h2>
          <p className="text-muted-foreground">
            Het is verboden om AetherLearn te gebruiken voor illegale doeleinden, 
            om inbreuk te maken op intellectuele eigendomsrechten van anderen, 
            of om malware of schadelijke code te verspreiden.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Beëindiging</h2>
          <p className="text-muted-foreground">
            AetherLearn behoudt zich het recht voor om jouw account en toegang tot de dienst 
            te beëindigen zonder voorafgaande kennisgeving, om welke reden dan ook.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Wijzigingen</h2>
          <p className="text-muted-foreground">
            AetherLearn behoudt zich het recht voor om deze voorwaarden op elk moment te wijzigen. 
            Je wordt geacht deze pagina regelmatig te controleren op wijzigingen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground mb-4">
            Heb je vragen over deze voorwaarden of zakelijke vragen? Neem contact met ons op.
          </p>
          <Link 
            href="https://docs.google.com/forms/d/PLACEHOLDER_DUTCH_FORM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Zakelijke Vragen
          </Link>
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
