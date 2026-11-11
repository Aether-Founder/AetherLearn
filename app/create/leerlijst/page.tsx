import { AppShell } from '@/components/AppShell';
import CreateLearningSetForm from '@/components/learning-set/CreateLearningSetForm';

export const dynamic = 'force-dynamic';

export default function CreateLeerlijstPage() {
  return (
    <AppShell>
      <div className="py-10 max-w-3xl mx-auto">
        <CreateLearningSetForm />
      </div>
    </AppShell>
  );
}
