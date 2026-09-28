import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';

export default function Home() {
  return (
    <Section>
      <VStack gap={4}>
        <Heading level={1} type="display-2">
          Yannick Beck
        </Heading>
        <Text>
          Persönliche Website im Aufbau — Projekte, Blog und Kontakt. Inhalte
          kommen aus Ghost, das Designsystem ist Astryx.
        </Text>
        <HStack gap={2}>
          <Button label="Projekte ansehen" variant="primary" href="/projekte" />
          <Button label="Kontakt" variant="secondary" href="/kontakt" />
        </HStack>
      </VStack>
    </Section>
  );
}
