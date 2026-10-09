'use client';

import dynamic from 'next/dynamic';

/**
 * Kontaktformular als eigener, nachladbarer Chunk (Fix-Runde 3). Ein statischer Import in der
 * Server-Komponente contact-block.tsx hängte den Formular-Chunk (Astryx-Felder, ~39 KB
 * unkomprimiert) in das Bundle von /, /en und /kontakt – auch ohne NEXT_PUBLIC_CONTACT_FORM, wo
 * nichts davon gerendert wird. Server-Komponenten splitten Client-Komponenten nicht ab, auch nicht
 * per next/dynamic (lazy-loading.md); in einer Client-Komponente lädt next/dynamic den Chunk nur,
 * wenn sie gerendert wird. Mit Flag: serverseitig gerendert (ssr ist Standard), der Chunk wird
 * beim Laden vorgeladen – kein Layoutsprung; ohne Flag rendert contact-block.tsx das hier nie.
 */
export const ContactFormLazy = dynamic(() => import('@/components/contact-form').then((m) => m.ContactForm));
