import { useEffect, useRef, useState } from "react";

import { UndrawIllustration } from "react-undraw";
import type { UndrawIllustrationProps } from "../UndrawIllustration.js";

type ViewportIllustrationProps = UndrawIllustrationProps;

export function ViewportIllustration(props: ViewportIllustrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="card-art-inner">
      {visible ? (
        <UndrawIllustration {...props} />
      ) : (
        <div className="card-art-skeleton" aria-hidden />
      )}
    </div>
  );
}
