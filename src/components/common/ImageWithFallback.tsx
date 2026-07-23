import React from 'react';

const DEFAULT_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" fill="none">
  <rect width="1200" height="800" rx="48" fill="#0f172a"/>
  <rect x="56" y="56" width="1088" height="688" rx="40" fill="url(#paint0_linear)"/>
  <circle cx="960" cy="184" r="120" fill="#10b981" fill-opacity="0.16"/>
  <circle cx="226" cy="602" r="180" fill="#f59e0b" fill-opacity="0.14"/>
  <path d="M206 520C286 420 394 376 521 376C648 376 759 422 839 520" stroke="#d1fae5" stroke-width="20" stroke-linecap="round"/>
  <path d="M344 462C386 418 444 392 508 392C572 392 628 418 668 462" stroke="#fbbf24" stroke-width="20" stroke-linecap="round"/>
  <rect x="304" y="522" width="592" height="106" rx="30" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.18"/>
  <text x="600" y="564" text-anchor="middle" fill="#ecfeff" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700">
    YatimCare
  </text>
  <text x="600" y="607" text-anchor="middle" fill="#d1fae5" font-family="Arial, Helvetica, sans-serif" font-size="20">
    Program Donasi
  </text>
  <defs>
    <linearGradient id="paint0_linear" x1="56" y1="56" x2="1144" y2="744" gradientUnits="userSpaceOnUse">
      <stop stop-color="#134e4a"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
</svg>`;

const DEFAULT_PLACEHOLDER_SRC = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEFAULT_PLACEHOLDER_SVG)}`;

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function ImageWithFallback({
  fallbackSrc = DEFAULT_PLACEHOLDER_SRC,
  src,
  alt,
  ...props
}: ImageWithFallbackProps) {
  return (
    <img
      {...props}
      src={src || fallbackSrc}
      alt={alt}
      onError={(event) => {
        const image = event.currentTarget;
        if (image.dataset.fallbackApplied === '1') {
          return;
        }

        image.dataset.fallbackApplied = '1';
        image.src = fallbackSrc;
      }}
    />
  );
}
