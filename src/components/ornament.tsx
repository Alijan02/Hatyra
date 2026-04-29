type Props = { className?: string };

// Декоративный орнамент в стиле центральноазиатских узоров — две тонкие линии
// и ромб посередине. Используется как разделитель между секциями.
export function Ornament({ className }: Props) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="1" />
      <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="1" />
      <path
        d="M60 1 L65 6 L60 11 L55 6 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="48" cy="6" r="1.5" fill="currentColor" />
      <circle cx="72" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}
