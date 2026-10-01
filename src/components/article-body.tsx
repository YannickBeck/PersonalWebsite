import Image from 'next/image';
import { Text } from '@astryxdesign/core/Text';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';
import { ItemCover } from '@/components/item-cover';
import type { TocEntry } from '@/components/reading-layout';
import { realImage } from '@/lib/images';
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

function Block({ block, seed }: { block: ArticleBlock; seed: string }) {
  switch (block.type) {
    case 'intro':
      return (
        <Text as="p" type="large" color="secondary">
          {block.text}
        </Text>
      );
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
    case 'image': {
      // Platzhalter-SVGs gelten als „kein Bild“ → generatives Cover statt Mikrotext-Grafik (V6)
      const src = realImage(block.src);
      return (
        <figure>
          {src ? (
            <Image
              src={src}
              alt={block.alt}
              width={1280}
              height={800}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          ) : (
            <ItemCover src={null} seed={`${seed}-figure`} variant="hero" motif="article" />
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    }
  }
}

/** Inhaltsverzeichnis-Einträge (h2) eines Demo-Artikels für die Randspalte. */
export function tocFromArticle(article: DemoArticle): TocEntry[] {
  return article.blocks
    .filter((b): b is Extract<ArticleBlock, { type: 'heading' }> => b.type === 'heading')
    .map((b) => ({ id: slugify(b.text), text: b.text }));
}

/** Rendert einen Demo-Artikel; Inhaltsverzeichnis steht in der Randspalte (ReadingLayout). */
export function ArticleBody({ article }: { article: DemoArticle }) {
  return (
    <article className={styles.prose}>
      {article.blocks.map((b, i) => (
        <Block key={i} block={b} seed={article.slug} />
      ))}
    </article>
  );
}
