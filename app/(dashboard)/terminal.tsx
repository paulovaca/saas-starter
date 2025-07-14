'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import styles from './terminal.module.css';

export function Terminal() {
  const [terminalStep, setTerminalStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const terminalSteps = [
    'git clone https://github.com/nextjs/saas-starter',
    'pnpm install',
    'pnpm db:setup',
    'pnpm db:migrate',
    'pnpm db:seed',
    'pnpm dev 🎉',
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalStep((prev) =>
        prev < terminalSteps.length - 1 ? prev + 1 : prev
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [terminalStep]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(terminalSteps.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.dots}>
            <div className={`${styles.dot} ${styles.dotRed}`}></div>
            <div className={`${styles.dot} ${styles.dotYellow}`}></div>
            <div className={`${styles.dot} ${styles.dotGreen}`}></div>
          </div>
          <button
            onClick={copyToClipboard}
            className={styles.copyButton}
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className={styles.icon} />
            ) : (
              <Copy className={styles.icon} />
            )}
          </button>
        </div>
        <div className={styles.steps}>
          {terminalSteps.map((step, index) => (
            <div
              key={index}
              className={`${styles.step} ${index > terminalStep ? styles.stepHidden : styles.stepVisible}`}
            >
              <span className={styles.prompt}>$</span> {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
