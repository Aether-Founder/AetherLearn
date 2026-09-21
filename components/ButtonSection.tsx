'use client';

import { ButtonConfig } from '@/types/filesystem';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ButtonSectionProps {
  buttons: ButtonConfig[];
}

export default function ButtonSection({ buttons }: ButtonSectionProps) {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.style === 'primary' ? 'default' : 'outline'}
          asChild
        >
          <a href={button.targetPath} target="_blank" rel="noopener noreferrer">
            {button.icon && <span className="mr-2">{button.icon}</span>}
            {button.text}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  );
}
