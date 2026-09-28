import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

export function PageHero({
  title,
  lede,
  display = false,
}: {
  title: string;
  lede: string;
  display?: boolean;
}) {
  return (
    <Section>
      <VStack gap={3}>
        {display ? (
          <Heading level={1} type="display-2">
            {title}
          </Heading>
        ) : (
          <Heading level={1}>{title}</Heading>
        )}
        <Text type="large">{lede}</Text>
      </VStack>
    </Section>
  );
}
