const BASE = 'animate-pulse bg-background-200 rounded';

const VARIANT_RENDERERS = {
  text: ({ className }) => (
    <div className={`${BASE} h-4 w-full rounded${className ? ` ${className}` : ''}`} />
  ),

  title: ({ className }) => (
    <div className={`${BASE} h-6 w-3/4 rounded${className ? ` ${className}` : ''}`} />
  ),

  avatar: ({ className }) => (
    <div className={`${BASE} h-10 w-10 rounded-full${className ? ` ${className}` : ''}`} />
  ),

  card: ({ className }) => (
    <div className={`${BASE} h-48 w-full rounded-2xl${className ? ` ${className}` : ''}`} />
  ),

  button: ({ className }) => (
    <div className={`${BASE} h-10 w-24 rounded-xl${className ? ` ${className}` : ''}`} />
  ),

  badge: ({ className }) => (
    <div className={`${BASE} h-6 w-16 rounded-full${className ? ` ${className}` : ''}`} />
  ),

  'table-row': ({ className }) => (
    <div className={`flex gap-4 p-4${className ? ` ${className}` : ''}`}>
      <div className={`${BASE} h-4 w-1/4 rounded`} />
      <div className={`${BASE} h-4 w-1/3 rounded`} />
      <div className={`${BASE} h-4 w-1/5 rounded`} />
      <div className={`${BASE} h-4 w-16 rounded`} />
    </div>
  ),

  'stat-card': ({ className }) => (
    <div className={`rounded-2xl border border-background-200/60 p-5${className ? ` ${className}` : ''}`}>
      <div className={`${BASE} h-4 w-24 rounded mb-3`} />
      <div className={`${BASE} h-8 w-32 rounded mb-2`} />
      <div className={`${BASE} h-3 w-20 rounded`} />
    </div>
  ),

  'gift-card': ({ className }) => (
    <div className={`rounded-2xl border border-background-200/60 p-4${className ? ` ${className}` : ''}`}>
      <div className={`${BASE} aspect-4/3 w-full rounded-xl mb-3`} />
      <div className={`${BASE} h-4 w-3/4 rounded mb-2`} />
      <div className={`${BASE} h-3 w-1/2 rounded mb-3`} />
      <div className={`${BASE} h-5 w-16 rounded`} />
    </div>
  ),

  'notification-item': ({ className }) => (
    <div className={`flex gap-3 p-4${className ? ` ${className}` : ''}`}>
      <div className={`${BASE} h-10 w-10 rounded-full flex-shrink-0`} />
      <div className="flex-1 space-y-2">
        <div className={`${BASE} h-4 w-3/4 rounded`} />
        <div className={`${BASE} h-3 w-1/2 rounded`} />
      </div>
    </div>
  ),
};

export function Skeleton({ variant = 'text', className }) {
  const renderer = VARIANT_RENDERERS[variant];
  if (!renderer) return null;
  return renderer({ className });
}

export function SkeletonCard({ className }) {
  return (
    <div className={`rounded-2xl border border-background-200/60 overflow-hidden${className ? ` ${className}` : ''}`}>
      <div className={`${BASE} aspect-4/3 w-full`} />
      <div className="p-4 space-y-3">
        <div className={`${BASE} h-4 w-3/4 rounded`} />
        <div className={`${BASE} h-3 w-1/2 rounded`} />
        <div className={`${BASE} h-5 w-20 rounded`} />
      </div>
    </div>
  );
}
