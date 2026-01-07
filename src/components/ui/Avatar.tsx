import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../lib/cn'

export function Avatar(props: {
  src?: string | null
  alt: string
  fallback: string
  sizeClassName?: string
  className?: string
  imgClassName?: string
  loading?: 'eager' | 'lazy'
}) {
  const {
    src,
    alt,
    fallback,
    sizeClassName = 'size-10',
    className,
    imgClassName,
    loading = 'eager',
  } = props

  const safeSrc = src ?? ''
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  // Reset fade state whenever the src changes.
  const key = useMemo(() => safeSrc, [safeSrc])
  useEffect(() => {
    // Check if image is already cached/loaded
    if (safeSrc) {
      const img = new Image()
      img.src = safeSrc
      if (img.complete) {
        setLoaded(true)
        setErrored(false)
        return
      }
    }
    setLoaded(false)
    setErrored(false)
  }, [key, safeSrc])

  const showImg = Boolean(safeSrc) && !errored
  const letter = (fallback || 'U').slice(0, 1).toUpperCase()

  const showShimmer = showImg && !loaded

  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden rounded-full border text-sm font-semibold',
        'border-slate-800/60 bg-slate-950/35 text-slate-100',
        sizeClassName,
        className,
      )}
    >
      {/* Loading shimmer (covers network/cache delay so it doesn't feel broken) */}
      {showShimmer && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse',
            'bg-[radial-gradient(380px_circle_at_30%_20%,rgba(59,130,246,0.28),transparent_62%),radial-gradient(420px_circle_at_80%_80%,rgba(168,85,247,0.18),transparent_65%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_35%)]',
          )}
          aria-hidden="true"
        />
      )}

      {showImg ? (
        <img
          key={key}
          src={safeSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-200',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      ) : null}

      {/* Fallback letter stays visible during loading (and fades out once the image is in). */}
      <span
        className={cn(
          'relative select-none transition-opacity duration-200',
          showImg && loaded ? 'opacity-0' : 'opacity-100',
        )}
        aria-hidden={showImg}
      >
        {letter}
      </span>
    </div>
  )
}


