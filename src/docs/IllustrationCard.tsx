import { type IllustrationMetadata } from "react-undraw";

import { ViewportIllustration } from "./ViewportIllustration";

type IllustrationCardProps = {
  item: IllustrationMetadata;
  primaryColor: string;
  onSelect: () => void;
};

export function IllustrationCard({
  item,
  primaryColor,
  onSelect,
}: IllustrationCardProps) {
  return (
    <button type="button" className="card" onClick={onSelect}>
      <div className="card-art">
        <ViewportIllustration
          name={item.name}
          primaryColor={primaryColor}
          height={140}
          title={item.title}
        />
      </div>
      <div className="card-body">
        <strong>{item.title}</strong>
        <span>{item.name}</span>
      </div>
    </button>
  );
}
