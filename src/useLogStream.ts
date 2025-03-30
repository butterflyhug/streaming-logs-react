import { useEffect, useRef, useState } from 'react';
import { LogFetcher, LogReader } from './shimTypes';
import {
  LogEntry,
  useNewlineDelimitedJsonStream,
} from './useNewlineDelimitedJsonStream';

export function useLogStream(
  url: string,
  fetch: LogFetcher,
): { isLoading: boolean; entries: LogEntry[] } {
  const { entries, appendChunk, clearStream } = useNewlineDelimitedJsonStream();

  const readerRef = useRef<LogReader | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading && readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = undefined;
    }
    clearStream();
    fetch(url).then((result) => {
      const reader = result.body?.getReader();
      if (reader) {
        readerRef.current = reader;
        setIsLoading(true);
      }
    });
  }, [url]);

  // After each render, if we haven't hit the end of the log, read the next chunk.
  useEffect(() => {
    if (!readerRef.current) {
      return;
    }
    readerRef.current.read().then((result) => {
      if (result.value !== undefined) {
        appendChunk(result.value);
      }
      if (result.done) {
        readerRef.current?.releaseLock();
        readerRef.current = undefined;
        setIsLoading(false);
      }
    });
  }, [appendChunk, isLoading]);

  return { entries, isLoading };
}
