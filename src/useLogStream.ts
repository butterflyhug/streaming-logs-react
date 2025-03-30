import { useEffect, useReducer } from 'react';
import { LogFetcher, LogReader } from './shimTypes';
import {
  LogEntry,
  useNewlineDelimitedJsonStream,
} from './useNewlineDelimitedJsonStream';

type LogStreamer = {
  reader?: LogReader;
  isLoading: boolean;
};

type ReaderAction =
  | { type: 'new-url'; url: string }
  | { type: 'new-reader'; reader: LogReader }
  | { type: 'load-chunk' }
  | { type: 'last-chunk' };

export function useLogStream(
  url: string,
  fetch: LogFetcher,
): { isLoading: boolean; entries: LogEntry[] } {
  const { entries, appendChunk, clearStream } = useNewlineDelimitedJsonStream();

  const [readerState, dispatchReader] = useReducer(
    (prevState: LogStreamer, action: ReaderAction): LogStreamer => {
      switch (action.type) {
        case 'new-url': {
          if (prevState.isLoading && prevState.reader) {
            prevState.reader.cancel();
          }
          clearStream();
          fetch(action.url).then((result) => {
            const reader = result.body?.getReader();
            if (reader) {
              dispatchReader({ type: 'new-reader', reader: reader });
            }
          });
          return { isLoading: true };
        }
        case 'new-reader': {
          dispatchReader({ type: 'load-chunk' });
          return { reader: action.reader, isLoading: true };
        }
        case 'load-chunk': {
          if (!readerState.reader) {
            throw new Error('cannot load-chunk without reader');
          }
          readerState.reader.read().then((result) => {
            if (result.value !== undefined) {
              appendChunk(result.value);
            }
            dispatchReader({ type: result.done ? 'last-chunk' : 'load-chunk' });
          });
          return { reader: readerState.reader, isLoading: true };
        }
        case 'last-chunk': {
          prevState.reader?.releaseLock();
          return { isLoading: false };
        }
      }
    },
    { isLoading: false },
  );

  useEffect(() => {
    dispatchReader({ type: 'new-url', url: url });
  }, [url]);

  return { entries, isLoading: readerState.isLoading };
}
