import { expect } from '@jest/globals';
import { LogFetcher, LogReader, LogReadResult } from './shimTypes';

export function makeFakeFetch({
  responseChunks,
  expectedURL,
}: {
  responseChunks: string[];
  expectedURL: string;
}): LogFetcher {
  const getReader = (): LogReader => {
    return {
      async read(): Promise<LogReadResult> {
        if (responseChunks.length < 1) {
          return { done: true };
        }
        const value = new TextEncoder().encode(responseChunks.shift());
        return { done: false, value };
      },
      async cancel() {},
      releaseLock(): void {},
    };
  };

  return (url: string | URL) => {
    expect(url).toEqual(expectedURL);
    return Promise.resolve({
      body: { getReader },
    });
  };
}
