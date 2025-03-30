import { useMemo, useState } from 'react';

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
  const [partial, setPartial] = useState('');
  const decoder = useMemo(() => new TextDecoder(), []);

  function appendChunk(bytes: Uint8Array) {
    let str = partial + decoder.decode(bytes);
    const chunk: LogEntry[] = [];
    let newlineIndex = str.indexOf('\n');
    while (newlineIndex > -1) {
      const data = JSON.parse(str.substring(0, newlineIndex));
      chunk.push({ id: globalThis.crypto.randomUUID(), data });
      str = str.substring(newlineIndex + 1);
      newlineIndex = str.indexOf('\n');
    }
    if (chunk.length) {
      setEntries([...entries, ...chunk]);
    }
    setPartial(str);
  }

  function clearStream() {
    setEntries([]);
    setPartial('');
  }

  return { entries, appendChunk, clearStream };
}
