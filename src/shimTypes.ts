// Types that help me swap out the native fetch implementation for a fake in tests.

export type LogReadResult = { done: boolean; value?: Uint8Array };

export type LogReader = {
  read(...args: never[]): Promise<LogReadResult>;
  cancel(): Promise<void>;
  releaseLock(): void;
};

export type LogFetcher = (
  url: string | URL,
  init?: RequestInit,
) => Promise<{
  body: { getReader: (...args: never[]) => LogReader } | null;
}>;
