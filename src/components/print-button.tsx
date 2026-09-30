'use client';

import { Button } from '@astryxdesign/core/Button';
import { getDictionary, type Lang } from '@/i18n/dictionaries';

export function PrintButton({ lang }: { lang: Lang }) {
  return (
    <Button
      label={getDictionary(lang).printButton}
      variant="secondary"
      onClick={() => window.print()}
    />
  );
}
