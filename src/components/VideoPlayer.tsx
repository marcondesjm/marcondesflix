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
      embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`,
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
  const [started, setStarted] = useState(false);
  const { type, embedUrl } = parseEmbed(currentSrc);

  useEffect(() => {
    setCurrentSrc(src);
    setStarted(false);
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

  if (type === "youtube") {
    const srcWithPlayback = `${embedUrl}&autoplay=${started ? "1" : "0"}`;

    return (
      <div className="relative w-full h-full bg-black">
        <iframe
          key={srcWithPlayback}
          src={srcWithPlayback}
          title={title || "Aula"}
          className="w-full h-full pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {!started && (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/70 text-white"
            aria-label={`Assistir ${title || "aula"}`}
          >
            <span className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition hover:scale-105 hover:bg-red-500">
              Assistir aula
            </span>
          </button>
        )}
      </div>
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
