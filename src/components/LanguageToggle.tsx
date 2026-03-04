
'use client';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  current: 'en' | 'kn';
  onChange: (lang: 'en' | 'kn') => void;
}

export function LanguageToggle({ current, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-full border border-border">
      <Button
        variant={current === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('en')}
        className="rounded-full h-8 px-4 text-xs font-semibold transition-all"
      >
        English
      </Button>
      <Button
        variant={current === 'kn' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('kn')}
        className="rounded-full h-8 px-4 text-xs font-semibold transition-all"
      >
        ಕನ್ನಡ
      </Button>
      <Languages className="w-4 h-4 mx-2 text-muted-foreground" />
    </div>
  );
}
