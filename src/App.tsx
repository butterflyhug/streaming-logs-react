import { LogLine } from './LogLine';
import './styles.css';
import { useLogStream } from './useLogStream';

export default function App() {
  const { entries, isLoading } = useLogStream('/cribl.log', fetch);

  return (
    <div className="App">
      {isLoading && <div>loading...</div>}
      <header className="line">
        <div className="expand-toggle">&nbsp;</div>
        <div className="time">Time</div>
        <div className="json">Event</div>
      </header>
      {entries.map((line) => (
        <LogLine line={line} key={line.id} />
      ))}
    </div>
  );
}
