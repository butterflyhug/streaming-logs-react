import './styles.css';
import { useLogStream } from './useLogStream';

export default function App() {
  const { entries, isLoading } = useLogStream('/cribl.log', fetch);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <div>{isLoading ? 'loading...' : 'done!'}</div>
      {entries.map(({ id, data }) => (
        <code>
          <pre key={id}>{JSON.stringify(data)}</pre>
        </code>
      ))}
    </div>
  );
}
