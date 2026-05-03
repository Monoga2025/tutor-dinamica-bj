import { useEffect, useRef } from 'react';
import katex from 'katex';

export function KatexInline({ latex, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && latex) {
      try {
        katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
      } catch {}
    }
  }, [latex]);
  return <span ref={ref} style={style} />;
}

export function KatexDisplay({ latex, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && latex) {
      try {
        katex.render(latex, ref.current, { throwOnError: false, displayMode: true });
      } catch {}
    }
  }, [latex]);
  return <div ref={ref} style={{ overflowX: 'auto', ...style }} />;
}
