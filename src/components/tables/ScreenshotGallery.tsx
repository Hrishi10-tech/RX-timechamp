import { useState, useMemo } from 'react';
import { Monitor, Clock, User, Maximize2 } from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';

interface ScreenshotItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  userName: string;
  deviceName: string;
  capturedAt: string;
  applicationName?: string;
}

interface ScreenshotGalleryProps {
  screenshots: ScreenshotItem[];
  onScreenshotClick?: (screenshot: ScreenshotItem) => void;
  pageSize?: number;
  columns?: 2 | 3 | 4;
}

export function ScreenshotGallery({
  screenshots,
  onScreenshotClick,
  pageSize = 12,
  columns = 3,
}: ScreenshotGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(screenshots.length / pageSize);
  const paginatedScreenshots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return screenshots.slice(start, start + pageSize);
  }, [screenshots, currentPage, pageSize]);

  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div>
      {screenshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 dark:border-gray-700 dark:bg-gray-800">
          <Monitor className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No screenshots available
          </p>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${gridCols[columns]}`} role="list" aria-label="Screenshot gallery">
            {paginatedScreenshots.map((screenshot) => (
              <article
                key={screenshot.id}
                className="group overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                role="listitem"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={screenshot.thumbnailUrl}
                    alt={`Screenshot from ${screenshot.userName} on ${screenshot.deviceName}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  {onScreenshotClick && (
                    <button
                      onClick={() => onScreenshotClick(screenshot)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100"
                      aria-label={`View screenshot from ${screenshot.userName}`}
                    >
                      <Maximize2 className="h-8 w-8 text-white" />
                    </button>
                  )}
                  {screenshot.applicationName && (
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                      {screenshot.applicationName}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{screenshot.userName}</span>
                    </div>
                    <span aria-hidden="true">|</span>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      <span>{screenshot.deviceName}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="h-3 w-3" />
                    <time>{screenshot.capturedAt}</time>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
