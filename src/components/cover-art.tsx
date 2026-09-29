import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { Text } from '@astryxdesign/core/Text';

const VARIANTS = ['blue', 'cyan', 'purple', 'teal', 'green'] as const;

/**
 * Platzhalter-Cover für Projekte/Artikel ohne Feature-Image:
 * farbcodiert pro Slug, Code-Motiv. Ersetzt durch Ghost-Cover sobald vorhanden.
 */
export function CoverArt({ seed, motif = '</>' }: { seed: string; motif?: string }) {
  let h = 0;
  for (const c of seed) {
    h = (h * 31 + c.charCodeAt(0)) % 997;
  }
  return (
    <Card variant={VARIANTS[h % VARIANTS.length]} height={140}>
      <VStack gap={1}>
        <Text type="code">{motif}</Text>
        <Text type="code">{`~/${seed}`}</Text>
      </VStack>
    </Card>
  );
}
