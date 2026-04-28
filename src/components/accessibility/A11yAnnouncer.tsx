import { useEffect, useState, useCallback } from 'react';

interface Announcement {
  message: string;
  priority: 'polite' | 'assertive';
}

let announceCallback: ((announcement: Announcement) => void) | null = null;

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  announceCallback?.({ message, priority });
}

export function A11yAnnouncer() {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const handleAnnouncement = useCallback((announcement: Announcement) => {
    if (announcement.priority === 'assertive') {
      setAssertiveMessage('');
      requestAnimationFrame(() => {
        setAssertiveMessage(announcement.message);
      });
    } else {
      setPoliteMessage('');
      requestAnimationFrame(() => {
        setPoliteMessage(announcement.message);
      });
    }
  }, []);

  useEffect(() => {
    announceCallback = handleAnnouncement;
    return () => {
      announceCallback = null;
    };
  }, [handleAnnouncement]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  );
}
