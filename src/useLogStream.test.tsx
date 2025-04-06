import { describe, it, expect } from '@jest/globals';
import { useLogStream } from './useLogStream';
import { act, render, waitFor } from '@testing-library/react';
import { makeFakeFetch } from './fetch.fake';
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';
import { LogEntry } from './useNewlineDelimitedJsonStream';

// Node doesn't always have these standard globals?
// I thought they were added long ago but they're not present for me...
// so I'm just hacking around it for now.
globalThis.TextEncoder = TextEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.TextDecoder = TextDecoder as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.crypto = crypto as any;

describe('useLogStream', () => {
  it('automatically starts loading data', async () => {
    const url = 'https://example.com/test.log';
    const fakeFetch = makeFakeFetch({
      expectedURL: url,
      responseChunks: [
        '{"_time":1234}\n',
        '{"_time":1235}',
        '\n{"_time":',
        '1236}\n',
      ],
    });

    function UseLogStreamTest() {
      const { isLoading } = useLogStream(url, fakeFetch.fetch);
      return <code data-testid="isLoading">{JSON.stringify(isLoading)}</code>;
    }

    const rendered = await act(() => render(<UseLogStreamTest />));
    const isLoadingElement = rendered.container.querySelector(
      '[data-testid="isLoading"]',
    );
    expect(isLoadingElement!.textContent).toEqual('true');
  });

  it('eventually loads all streaming data', async () => {
    console.log('eventually loads');
    const url = 'https://example.com/test.log';
    const fakeFetch = makeFakeFetch({
      expectedURL: url,
      responseChunks: [
        '{"_time":1234}\n',
        '{"_time":1235}',
        '\n{"_time":',
        '1236}\n',
      ],
    });

    function UseLogStreamTest() {
      const { entries, isLoading } = useLogStream(url, fakeFetch.fetch);
      return (
        <div>
          <code data-testid="isLoading">{JSON.stringify(isLoading)}</code>
          <code data-testid="lines">{JSON.stringify(entries)}</code>
        </div>
      );
    }

    const rendered = await act(async () => render(<UseLogStreamTest />));

    // pump through the expected number of useEffects needed to process three read chunks
    await act(() => rendered.rerender(<UseLogStreamTest />));
    await act(() => rendered.rerender(<UseLogStreamTest />));
    await act(() => rendered.rerender(<UseLogStreamTest />));
    await act(() => rendered.rerender(<UseLogStreamTest />));

    // confirm that we've actually waited long enough for loading to finish
    await fakeFetch.readingDone;
    await waitFor(async () => {
      return (await rendered.getByTestId('isLoading')).textContent === 'false';
    });

    const lines = JSON.parse(
      (await rendered.getByTestId('lines').textContent) ?? 'null',
    ) as LogEntry[];
    for (const lineKeys of lines.map((line) => Object.keys(line))) {
      expect(lineKeys.length).toEqual(2);
      expect(lineKeys).toContain('id');
      expect(lineKeys).toContain('data');
    }
    expect(lines.map(({ data }) => data)).toEqual([
      { _time: 1234 },
      { _time: 1235 },
      { _time: 1236 },
    ]);
  });
});
