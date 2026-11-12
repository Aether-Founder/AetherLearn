import { AppShell, PageHeader } from '@/components/AppShell';
import CreateLearningSetForm from '@/components/learning-set/CreateLearningSetForm';

export const dynamic = 'force-dynamic';

export default function CreateDeckPage() {
  return (
    <AppShell>
      <PageHeader
        title="New study set"
        description="Create a new study set with questions and answers."
      />

      <div className="mt-8">
        <CreateLearningSetForm />
      </div>
    </AppShell>
  );
}
