import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  title?: string;
};

const FALLBACK_DEMO_VIDEO =
  "https://www.youtube.com/watch?v=tIb_TzVNbDM";

type ParsedVideo = {
  type: "youtube" | "vimeo" | "file";
  embedUrl: string;
  youtubeId?: string;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady: () => void;
            onStateChange: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise<void>((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        resolve();
      };

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

function parseEmbed(url: string): ParsedVideo {
  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&enablejsapi=1&cc_load_policy=0`,
      youtubeId: yt[1],
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
  const fileVideoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { type, embedUrl, youtubeId } = parseEmbed(currentSrc);
  const progressKey = useMemo(
    () => `marcondesflix:video-progress:${currentSrc}`,
    [currentSrc]
  );

  const getSavedTime = () => {
    if (typeof window === "undefined") return 0;
    const saved = Number(window.localStorage.getItem(progressKey) || 0);
    return Number.isFinite(saved) && saved > 3 ? saved : 0;
  };

  const saveTime = (seconds: number, duration?: number) => {
    if (typeof window === "undefined" || !Number.isFinite(seconds)) return;
    if (duration && seconds >= duration - 5) {
      window.localStorage.removeItem(progressKey);
      return;
    }
    window.localStorage.setItem(progressKey, String(Math.floor(seconds)));
  };

  useEffect(() => {
    setCurrentSrc(src);
    setStarted(false);
    setIsPlaying(false);
  }, [src]);

  useEffect(() => {
    if (type !== "youtube" || !youtubeId || !youtubeContainerRef.current) return;

    let cancelled = false;
    const element = youtubeContainerRef.current;
    element.innerHTML = "";

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;

      youtubePlayerRef.current = new window.YT.Player(element, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          cc_load_policy: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            const savedTime = getSavedTime();
            if (savedTime) {
              youtubePlayerRef.current?.seekTo(savedTime, true);
            }
          },
          onStateChange: (event) => {
            const states = window.YT?.PlayerState;
            if (event.data === states?.PLAYING) setIsPlaying(true);
            if (event.data === states?.PAUSED) {
              setIsPlaying(false);
              const player = youtubePlayerRef.current;
              if (player) saveTime(player.getCurrentTime(), player.getDuration());
            }
            if (event.data === states?.ENDED) {
              setIsPlaying(false);
              window.localStorage.removeItem(progressKey);
            }
          },
        },
      });
    });

    const progressTimer = window.setInterval(() => {
      const player = youtubePlayerRef.current;
      if (player) saveTime(player.getCurrentTime(), player.getDuration());
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      const player = youtubePlayerRef.current;
      if (player) saveTime(player.getCurrentTime(), player.getDuration());
      player?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [progressKey, type, youtubeId]);

  const toggleYouTubePlayback = () => {
    const player = youtubePlayerRef.current;
    setStarted(true);

    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
      saveTime(player.getCurrentTime(), player.getDuration());
      setIsPlaying(false);
      return;
    }

    const savedTime = getSavedTime();
    if (savedTime) player.seekTo(savedTime, true);
    player.playVideo();
    setIsPlaying(true);
  };

  if (type === "file") {
    return (
      <video
        ref={fileVideoRef}
        key={currentSrc}
        src={embedUrl}
        controls
        className="w-full h-full"
        poster={poster}
        onLoadedMetadata={() => {
          const savedTime = getSavedTime();
          if (fileVideoRef.current && savedTime) {
            fileVideoRef.current.currentTime = savedTime;
          }
        }}
        onPause={(event) => saveTime(event.currentTarget.currentTime, event.currentTarget.duration)}
        onTimeUpdate={(event) => saveTime(event.currentTarget.currentTime, event.currentTarget.duration)}
        onError={() => {
          if (currentSrc !== FALLBACK_DEMO_VIDEO) {
            setCurrentSrc(FALLBACK_DEMO_VIDEO);
          }
        }}
      />
    );
  }

  if (type === "youtube") {
    return (
      <div className="relative w-full h-full overflow-hidden bg-black">
        <div className="absolute -left-12 -right-12 -top-12 -bottom-28 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:pointer-events-none">
          <div ref={youtubeContainerRef} className="h-full w-full" title={title || "Aula"} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black via-black/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-t from-black via-black/90 to-transparent" />
        {!started && (
          <button
            type="button"
            onClick={toggleYouTubePlayback}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 text-white"
            aria-label={`Assistir ${title || "aula"}`}
          >
            <span className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition hover:scale-105 hover:bg-red-500">
              Assistir aula
            </span>
          </button>
        )}
        {started && !isPlaying && (
          <button
            type="button"
            onClick={toggleYouTubePlayback}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/65 text-white backdrop-blur-sm"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Aula pausada
            </span>
            <span className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl transition hover:scale-105 hover:bg-red-500">
              Continuar aula
            </span>
          </button>
        )}
        {started && isPlaying && (
          <button
            type="button"
            onClick={toggleYouTubePlayback}
            className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/25 bg-red-600/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-red-600"
          >
            {isPlaying ? "Pausar aula" : "Continuar aula"}
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
