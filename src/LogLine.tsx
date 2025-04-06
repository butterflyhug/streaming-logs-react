import { ReactElement, useMemo, useState } from 'react';
import { LogEntry } from './useNewlineDelimitedJsonStream';

type LogLineProps = {
  line: LogEntry;
};

export function LogLine({ line }: LogLineProps): ReactElement {
  const [expanded, setExpanded] = useState(false);

  const time = useMemo(() => new Date(line.data._time), []);

  if (!expanded) {
    return (
      <div className="line">
        <button className="expand-toggle" onClick={() => setExpanded(true)}>
          ⏵
        </button>
        <time className="time" dateTime={time.toISOString()}>
          {time.toISOString()}
        </time>
        <code className="json">{JSON.stringify(line.data)}</code>
      </div>
    );
  }

  return (
    <div className="line expanded">
      <button className="expand-toggle" onClick={() => setExpanded(false)}>
        ⏷
      </button>
      <time className="time" dateTime={time.toISOString()}>
        {time.toISOString()}
      </time>
      <code className="json">{JSON.stringify(line.data, undefined, 2)}</code>
    </div>
  );
}
