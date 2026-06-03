import Image from 'next/image';

interface CountryFlagProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { w: 22, h: 14 },
  md: { w: 32, h: 20 },
  lg: { w: 48, h: 30 },
};

export function CountryFlag({ code, size = 'md', className = '' }: CountryFlagProps) {
  const { w, h } = sizeMap[size];
  const src = `/flags/${code}.png`;

  return (
    <Image
      src={src}
      alt={`${code} flag`}
      width={w}
      height={h}
      className={`inline-block object-contain ${className}`}
      unoptimized
    />
  );
}

// Lightweight version for tables - just img tag
export function FlagImg({ code, w = 24, h = 16, className = '' }: { code: string; w?: number; h?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.png`}
      alt=""
      width={w}
      height={h}
      className={`inline-block object-contain ${className}`}
    />
  );
}
