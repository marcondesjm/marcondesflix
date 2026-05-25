import { useEffect, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  title?: string;
};

const FALLBACK_DEMO_VIDEO =
  "https://www.youtube.com/watch?v=tIb_TzVNbDM";

function parseEmbed(url: string): { type: "youtube" | "vimeo" | "file"; embedUrl: string } {
  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`,
    };
  }
  // Vimeo: vimeo.com/123 or player.vimeo.com/video/123
  const vm = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vm) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };
  }
  return { type: "file", embedUrl: url };
}

export function VideoPlayer({ src, poster, title }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const { type, embedUrl } = parseEmbed(currentSrc);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  if (type === "file") {
    return (
      <video
        key={currentSrc}
        src={embedUrl}
        controls
        className="w-full h-full"
        poster={poster}
        onError={() => {
          if (currentSrc !== FALLBACK_DEMO_VIDEO) {
            setCurrentSrc(FALLBACK_DEMO_VIDEO);
          }
        }}
      />
    );
  }

  return (
    <iframe
      key={embedUrl}
      src={embedUrl}
      title={title || "Aula"}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}
