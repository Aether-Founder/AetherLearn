import { AppShell, PageHeader } from '@/components/AppShell';
import CreateLearningSetForm from '@/components/learning-set/CreateLearningSetForm';

export const dynamic = 'force-dynamic';

export default function CreateDeckPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Leersets"
        title="Nieuwe leerset"
        description="Maak een nieuwe leerset met vragen en antwoorden."
      />

      <div className="mt-8 max-w-3xl">
        <CreateLearningSetForm />
      </div>
    </AppShell>
  );
}
