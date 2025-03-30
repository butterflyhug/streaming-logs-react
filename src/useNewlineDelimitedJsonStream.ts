import { useMemo, useRef, useState } from 'react';

type LogData = {
  _time: string;
};

export type LogEntry = {
  id: string;
  data: LogData;
};

export function useNewlineDelimitedJsonStream(): {
  entries: LogEntry[];
  appendChunk: (chunk: Uint8Array) => void;
  clearStream: () => void;
} {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const partialRef = useRef('');
  const decoder = useMemo(() => new TextDecoder(), []);

  function appendChunk(bytes: Uint8Array) {
    let str = partialRef.current + decoder.decode(bytes);
    const chunk: LogEntry[] = [];
    let newlineIndex = str.indexOf('\n');
    while (newlineIndex > -1) {
      const line = str.substring(0, newlineIndex);
      try {
        const data = JSON.parse(line);
        chunk.push({ id: globalThis.crypto.randomUUID(), data });
      } catch {
        console.warn(line);
      }
      str = str.substring(newlineIndex + 1);
      newlineIndex = str.indexOf('\n');
    }
    if (chunk.length) {
      setEntries([...entries, ...chunk]);
    }
    partialRef.current = str;
  }

  function clearStream() {
    setEntries([]);
    partialRef.current = '';
  }

  return { entries, appendChunk, clearStream };
}
