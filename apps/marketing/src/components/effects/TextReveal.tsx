import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

/**
 * TextReveal — character-by-character fade-in for hero headlines.
 * Reduced-motion fallback: renders text immediately, no stagger.
 *
 * Pass plain string OR a <slot>-style structure via children.
 * For static-text usage prefer the `text` prop; the children path lets you
 * embed custom <em> spans (Astro doesn't compose well otherwise).
 */
interface Props {
  text: string;
  className?: string;
  delay?: number;
  emphasis?: { from: number; to: number; className?: string };
}

export default function TextReveal({ text, className = '', delay = 0, emphasis }: Props) {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    if (emphasis) {
      const before = text.slice(0, emphasis.from);
      const middle = text.slice(emphasis.from, emphasis.to);
      const after = text.slice(emphasis.to);
      return (
        <span className={className}>
          {before}
          <em className={emphasis.className}>{middle}</em>
          {after}
        </span>
      );
    }
    return <span className={className}>{text}</span>;
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.018, delayChildren: delay },
    },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  const renderChar = (char: string, key: string): ReactNode => (
    <motion.span key={key} variants={childVariants} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
      {char}
    </motion.span>
  );

  const chars = text.split('');
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ display: 'inline-block' }}
    >
      {chars.map((c, i) => {
        const inEmphasis = emphasis && i >= emphasis.from && i < emphasis.to;
        if (inEmphasis) {
          // Wrap each emphasized char with the emphasis className via an <em>
          return (
            <em key={i} className={emphasis!.className} style={{ fontStyle: 'italic' }}>
              {renderChar(c, `e${i}`)}
            </em>
          );
        }
        return renderChar(c, `c${i}`);
      })}
    </motion.span>
  );
}
