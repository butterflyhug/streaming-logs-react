import './styles.css';
import { useLogStream } from './useLogStream';

export default function App() {
  const { entries, isLoading } = useLogStream('/cribl.log', fetch);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <div>
        {isLoading ? 'loading...' : `loaded ${entries.length} log lines!`}
      </div>
      {entries.map(({ id, data }) => (
        <code key={id}>
          <pre>{JSON.stringify(data)}</pre>
        </code>
      ))}
    </div>
  );
}
