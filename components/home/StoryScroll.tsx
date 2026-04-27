'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Scene = {
  src: string;
  alt: string;
  label: string;
  headline: string;
  body: string;
  badge: string;
  bgClass: string;
};

const SCENES: Scene[] = [
  {
    src: '/images/maya/scene-1-form.jpg',
    alt: 'Maya at her laptop, filling out the Inlet Move quote form.',
    label: 'Scene 01 · The booking',
    headline: 'Maya needs to <em>move.</em>',
    body: 'She opens Inlet Move on her laptop. Six fields. No login. The whole thing takes the time it does to make coffee.',
    badge: '60-second form · No site visit',
    bgClass: 'bg-paper',
  },
  {
    src: '/images/maya/scene-2-scan.jpg',
    alt: 'Maya walking through her living room with her phone, scanning items.',
    label: 'Scene 02 · The walkthrough',
    headline: 'She walks the room with her <em>phone.</em>',
    body: 'The camera identifies the sofa, the bookshelf, the lamp. Volume estimated. Hours estimated. No padded surprise.',
    badge: 'AI inventory · Coming Q3 2026',
    bgClass: 'bg-bone',
  },
  {
    src: '/images/maya/scene-3-quote.jpg',
    alt: 'Maya on her sofa looking at her phone with the Inlet Move quote on screen.',
    label: 'Scene 03 · The quote',
    headline: 'A real number, in <em>minutes.</em>',
    body: 'Hourly. Honest. Fuel and stairs included. The price you see is the price you pay.',
    badge: 'Itemized · Quote = bill',
    bgClass: 'bg-bone-warm',
  },
  {
    src: '/images/maya/scene-4-move.jpg',
    alt: 'Maya at the doorway of her old apartment, watching the crew carry a box to the van.',
    label: 'Scene 04 · Move day',
    headline: 'Two pros, on <em>time.</em>',
    body: 'Branded crew. Photo-documented load. SMS updates while you do the rest of your day.',
    badge: 'Photo documentation on every job',
    bgClass: 'bg-bone',
  },
  {
    src: '/images/maya/scene-5-settled.jpg',
    alt: 'Maya in her new apartment, seated on the floor with a coffee, half-unpacked boxes around her.',
    label: 'Scene 05 · Settled',
    headline: "And it's <em>done.</em>",
    body: 'Boxes in the right rooms. Receipt in your inbox. Your weekend back.',
    badge: 'Average overage: 4.1%',
    bgClass: 'bg-paper',
  },
];

/**
 * Story scroll — 5 scenes, NOT pinned. Each scene is its own 100vh
 * section. Image and text crossfade independently using useScroll
 * progress (0→1 across the scene's viewport crossing). v7's pinned
 * approach failed because the page felt stuck without real assets;
 * this approach feels cinematic because the user is genuinely
 * scrolling.
 *
 * Week 1 ships with placeholder image blocks. Week 3 swaps in the
 * 5 Maya AI-generated scenes once they're commissioned.
 */
export function StoryScroll() {
  return (
    <section aria-label="The move, scene by scene" className="relative">
      {SCENES.map((scene, i) => (
        <Scene key={scene.label} scene={scene} index={i} />
      ))}
    </section>
  );
}

function Scene({ scene, index }: { scene: Scene; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.6]);
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 1.04]);

  return (
    <div
      ref={ref}
      className={cn(
        'flex min-h-screen items-center px-6 py-20 md:px-8 md:py-24',
        scene.bgClass,
      )}
    >
      <div className="mx-auto grid max-w-container items-center gap-12 md:grid-cols-2">
        <motion.div
          style={reduced ? undefined : { opacity, y }}
          className="space-y-5"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-ember">{scene.label}</p>
          <h3
            className="font-display text-display-2 font-medium leading-tight tracking-tight text-inlet-navy display-soft"
            dangerouslySetInnerHTML={{
              __html: scene.headline.replaceAll(
                '<em>',
                '<em class="display-italic text-pacific">',
              ),
            }}
          />
          <p className="max-w-prose font-body text-lg leading-relaxed text-graphite">
            {scene.body}
          </p>
          <span className="inline-flex items-center gap-2 rounded-full border border-pacific/20 bg-pacific/10 px-4 py-2 font-mono text-sm text-pacific">
            {scene.badge}
          </span>
        </motion.div>

        <motion.div
          style={reduced ? undefined : { opacity, scale }}
          className="relative aspect-[3/4] overflow-hidden rounded-xl border border-dashed border-line-mid bg-bone-warm/50"
        >
          {/* Asset placeholder. Replaced Week 3 with real Maya scene image. */}
          <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
            <span className="mb-2 font-mono text-[0.7rem] uppercase tracking-widest text-ember">
              {scene.label}
            </span>
            <span className="font-body text-sm text-graphite">{scene.alt}</span>
            <span className="mt-3 font-mono text-[0.6875rem] text-mist-dim">
              [ Maya AI scene · Week 3 commission ]
            </span>
          </div>
          {/* Note: when real image lands, swap the placeholder for:
              <Image src={scene.src} alt={scene.alt} fill priority={index === 0} sizes="(max-width: 768px) 100vw, 50vw" />
              The `index` arg above is wired so first scene gets priority. */}
          {process.env.NODE_ENV === 'development' && index === 0 && (
            <span className="sr-only">first-scene-priority-flag</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
