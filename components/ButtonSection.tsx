'use client';

import { useState, useEffect } from 'react';
import { ButtonConfig } from '@/types/filesystem';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ButtonSectionProps {
  buttons?: ButtonConfig[];
  placement?: string;
  placementId?: string;
  className?: string;
}

export default function ButtonSection({ buttons: initialButtons, placement, placementId, className }: ButtonSectionProps) {
  const [buttons, setButtons] = useState<ButtonConfig[]>(initialButtons || []);

  // Fetch buttons from API if not provided
  useEffect(() => {
    if (!initialButtons && placement) {
      const fetchButtons = async () => {
        try {
          const params = new URLSearchParams({ placement });
          if (placementId) params.append('placementId', placementId);
          const response = await fetch(`/api/buttons?${params}`);
          const data = await response.json();
          setButtons(data.buttons || []);
        } catch (error) {
          console.error('Error fetching buttons:', error);
        }
      };
      fetchButtons();
    }
  }, [initialButtons, placement, placementId]);

  if (buttons.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
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
