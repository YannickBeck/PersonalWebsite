import Image from 'next/image';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';
import { Link } from '@astryxdesign/core/Link';
import { getDictionary, type Lang } from '@/i18n/dictionaries';
import type { ArticleBlock, DemoArticle } from '@/content/demo-articles';
import styles from './article-body.module.css';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ä]/g, 'ae')
    .replace(/[ö]/g, 'oe')
    .replace(/[ü]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'intro':
      return <Text type="large">{block.text}</Text>;
    case 'heading':
      return <h2 id={slugify(block.text)}>{block.text}</h2>;
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'list':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'quote':
      return <Blockquote cite={block.cite}>{block.text}</Blockquote>;
    case 'table':
      return (
        <table>
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'code':
      return (
        <div className={styles.codeScroll}>
          <CodeBlock
            code={block.code}
            language={block.language}
            title={block.title}
            width="100%"
          />
        </div>
      );
    case 'image':
      return (
        <figure>
          <Image
            src={block.src}
            alt={block.alt}
            width={1280}
            height={800}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
  }
}

/** Rendert einen Demo-Artikel mit Inhaltsverzeichnis (Anker-Links). */
export function ArticleBody({ lang, article }: { lang: Lang; article: DemoArticle }) {
  const tocTitle = getDictionary(lang).tocTitle;
  const headings = article.blocks.filter(
    (b): b is Extract<ArticleBlock, { type: 'heading' }> => b.type === 'heading',
  );
  return (
    <VStack gap={4}>
      {headings.length > 1 && (
        <nav aria-label={tocTitle}>
          <VStack gap={2}>
            <Heading level={2}>{tocTitle}</Heading>
            {headings.map((h) => (
              <Link key={h.text} href={`#${slugify(h.text)}`}>
                {h.text}
              </Link>
            ))}
          </VStack>
        </nav>
      )}
      <div className={styles.prose}>
        {article.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
    </VStack>
  );
}
