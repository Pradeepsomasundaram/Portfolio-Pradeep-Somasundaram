const words = [
  'PYTHON', 'TENSORFLOW', 'PYTORCH', 'AWS', 'REACT', 'LANGCHAIN',
  'SQL', 'SPARK', 'DOCKER', 'NLP', 'TRANSFORMERS', 'AIRFLOW',
];

/**
 * A full-bleed scrolling wall of keywords in huge kinetic type — a pure
 * visual "breather" between dense sections, no paragraph text at all.
 */
export const TechMarquee = () => {
  const line = [...words, ...words];

  return (
    <div className="relative py-10 overflow-hidden select-none" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-void to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-void to-transparent z-10" />
      <div className="flex whitespace-nowrap animate-marquee">
        {line.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={`mx-6 text-5xl md:text-7xl font-display font-bold tracking-tight ${
              i % 3 === 0
                ? 'heading-shimmer'
                : 'text-transparent [-webkit-text-stroke:1.5px_currentColor] text-gray-300 dark:text-gray-700'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};
