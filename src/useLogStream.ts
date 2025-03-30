import { useEffect, useReducer } from 'react';
import { LogFetcher, LogReader } from './shimTypes';

type LogStreamer = {
  reader?: LogReader;
  isLoading: boolean;
};

type FetcherAction =
  | { type: 'new-url'; data: string }
  | { type: 'new-reader'; data: LogReader }
  | { type: 'chunk'; data: Uint8Array }
  | { type: 'last-chunk'; data: Uint8Array };

export function useLogStream(url: string, fetch: LogFetcher) {
  const [state, dispatch] = useReducer(
    (prevState: LogStreamer, action: FetcherAction): LogStreamer => {
      switch (action.type) {
        case 'new-url': {
          if (prevState.isLoading && prevState.reader) {
            prevState.reader.cancel();
          }
          fetch(action.data).then((result) => {
            const reader = result.body?.getReader();
            if (reader) {
              dispatch({ type: 'new-reader', data: reader });
            }
          });
          return { isLoading: true };
        }
        case 'new-reader': {
          return { reader: action.data, isLoading: true };
        }
        case 'chunk': {
          appendChunk(action.data);
          return prevState;
        }
        case 'last-chunk': {
          appendChunk(action.data);
          prevState.reader?.releaseLock();
          return { isLoading: false };
        }
      }
    },
    { isLoading: false },
  );

  useEffect(() => {
    dispatch({ type: 'new-url', data: url });
  }, [url]);

  console.log(state);

  // TODO return
}
