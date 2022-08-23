/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";

interface CounterProps {
  start: number;
}

export default function Counter(props: CounterProps) {
  const [count, setCount] = useState(props.start);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count - 1)}>
        -1
      </button>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
