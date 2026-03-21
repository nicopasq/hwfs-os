import { useState, useEffect } from 'react';
import { useApp } from '../context';

export default function Clock() {
  const { T } = useApp();
  const [t, setT] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", color: T.td2, fontSize: 13, fontWeight: 600 }}>
      {t.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}
