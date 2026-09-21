import { Toaster as Sonner } from 'sonner';

const Toaster = ({ className }: { className?: string }) => {
  return <Sonner className={className} />;
};

export { Toaster };