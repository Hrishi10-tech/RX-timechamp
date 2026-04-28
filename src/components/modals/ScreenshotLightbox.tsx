import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Monitor, Clock, User } from 'lucide-react';

interface ScreenshotDetail {
  id: string;
  imageUrl: string;
  userName: string;
  deviceName: string;
  capturedAt: string;
  applicationName?: string;
}

interface ScreenshotLightboxProps {
  screenshots: ScreenshotDetail[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ScreenshotLightbox({
  screenshots,
  currentIndex,
  onClose,
  onNavigate,
}: ScreenshotLightboxProps) {
  const current = screenshots[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < screenshots.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [currentIndex, hasPrev, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [currentIndex, hasNext, onNavigate]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-label="Screenshot viewer"
      aria-modal="true"
    >
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center gap-4 text-sm text-white/80">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{current.userName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Monitor className="h-4 w-4" />
            <span>{current.deviceName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <time>{current.capturedAt}</time>
          </div>
          {current.applicationName && (
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs">
              {current.applicationName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            {currentIndex + 1} / {screenshots.length}
          </span>
          <a
            href={current.imageUrl}
            download
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Download screenshot"
          >
            <Download className="h-5 w-5" />
          </a>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <img
        src={current.imageUrl}
        alt={`Screenshot from ${current.userName} at ${current.capturedAt}`}
        className="max-h-[85vh] max-w-[90vw] rounded object-contain"
      />

      {/* Navigation */}
      {hasPrev && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 hover:bg-black/70 hover:text-white"
          aria-label="Previous screenshot"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/80 hover:bg-black/70 hover:text-white"
          aria-label="Next screenshot"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
