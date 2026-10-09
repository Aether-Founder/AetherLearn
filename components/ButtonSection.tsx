'use client';

import { useState, useEffect } from 'react';
import { ButtonConfig } from '@/types/filesystem';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SubjectButton {
  id: string;
  subjectId: string;
  subjectName: string;
  buttonText: string;
  htmlFile: string;
  createdAt: string;
}

interface ButtonSectionProps {
  buttons?: ButtonConfig[];
  placement?: string;
  placementId?: string;
  className?: string;
}

export default function ButtonSection({ buttons: initialButtons, placement, placementId, className }: ButtonSectionProps) {
  const [buttons, setButtons] = useState<ButtonConfig[]>(initialButtons || []);
  const [subjectButtons, setSubjectButtons] = useState<SubjectButton[]>([]);

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

  // Fetch admin subject buttons if placement is 'subject'
  useEffect(() => {
    if (placement === 'subject' && placementId) {
      const fetchSubjectButtons = async () => {
        try {
          const response = await fetch('/api/admin/subject-buttons');
          const data = await response.json();
          const allButtons = data.buttons || [];
          // Filter buttons for this specific subject
          const filtered = allButtons.filter((b: SubjectButton) => b.subjectId === placementId);
          setSubjectButtons(filtered);
        } catch (error) {
          console.error('Error fetching subject buttons:', error);
        }
      };
      fetchSubjectButtons();
    }
  }, [placement, placementId]);

  if (buttons.length === 0 && subjectButtons.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {/* Existing filesystem buttons */}
      {buttons.map((button, index) => (
        <Button
          key={`fs-${index}`}
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

      {/* Admin subject buttons */}
      {subjectButtons.map((button) => (
        <Button
          key={`admin-${button.id}`}
          variant="outline"
          asChild
        >
          <Link href={`/standalone/${button.htmlFile}`}>
            {button.buttonText}
          </Link>
        </Button>
      ))}
    </div>
  );
}
