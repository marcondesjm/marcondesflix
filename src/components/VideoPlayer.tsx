import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src: string;
  onProgress?: (seconds: number) => void;
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
  getPlaybackRate: () => number;
  pauseVideo: () => void;
  playVideo: () => void;
  setPlaybackRate: (rate: number) => void;
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

export function VideoPlayer({ src, onProgress, poster, title }: Props) {
  const fileVideoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
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
      setCurrentTime(duration);
      setVideoDuration(duration);
      onProgress?.(duration);
      return;
    }
    setCurrentTime(Math.max(0, seconds));
    if (duration && Number.isFinite(duration)) setVideoDuration(duration);
    window.localStorage.setItem(progressKey, String(Math.floor(seconds)));
    onProgress?.(seconds);
  };

  useEffect(() => {
    setCurrentSrc(src);
    setStarted(false);
    setIsPlaying(false);
    setPlaybackRate(1);
    setCurrentTime(0);
    setVideoDuration(0);
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
              setCurrentTime(savedTime);
            }
            const duration = youtubePlayerRef.current?.getDuration() || 0;
            setVideoDuration(duration);
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
    }, 1000);

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

  const seekYouTubeBy = (deltaSeconds: number) => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    const duration = player.getDuration() || 0;
    const nextTime = Math.max(0, Math.min(duration || Infinity, player.getCurrentTime() + deltaSeconds));
    player.seekTo(nextTime, true);
    setCurrentTime(nextTime);
    setVideoDuration(duration);
    saveTime(nextTime, duration);
  };

  const seekYouTubeTo = (seconds: number) => {
    const player = youtubePlayerRef.current;
    if (!player) return;
    const duration = player.getDuration() || videoDuration || 0;
    const nextTime = Math.max(0, Math.min(duration || Infinity, seconds));
    player.seekTo(nextTime, true);
    setCurrentTime(nextTime);
    setVideoDuration(duration);
    saveTime(nextTime, duration);
  };

  const changeYouTubeRate = (rate: number) => {
    const player = youtubePlayerRef.current;
    setPlaybackRate(rate);
    player?.setPlaybackRate(rate);
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
    const progressPercent = videoDuration ? Math.min(100, Math.max(0, (currentTime / videoDuration) * 100)) : 0;

    return (
      <div className="group relative w-full h-full overflow-hidden bg-black">
        <div className="absolute -left-12 -right-12 -top-12 -bottom-36 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:pointer-events-none">
          <div ref={youtubeContainerRef} className="h-full w-full" title={title || "Aula"} />
        </div>
        {!started && (
          <button
            type="button"
            onClick={toggleYouTubePlayback}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/15 text-white"
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
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 text-white"
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
            className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/25 bg-red-600/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white opacity-0 shadow-2xl backdrop-blur-md transition duration-200 hover:scale-105 hover:bg-red-600 group-hover:opacity-100 focus:opacity-100"
          >
            {isPlaying ? "Pausar aula" : "Continuar aula"}
          </button>
        )}
        {started && (
          <div className="absolute inset-x-5 bottom-20 z-30 opacity-0 transition duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(videoDuration || 1))}
              value={Math.min(Math.floor(currentTime), Math.max(1, Math.floor(videoDuration || 1)))}
              onChange={(event) => seekYouTubeTo(Number(event.currentTarget.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-red-600 outline-none"
              style={{
                background: `linear-gradient(to right, #ef0025 ${progressPercent}%, rgba(255,255,255,0.22) ${progressPercent}%)`,
              }}
              aria-label="Adiantar ou retroceder aula"
            />
          </div>
        )}
        {started && (
          <div className="absolute bottom-5 left-5 z-30 flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-white opacity-0 shadow-2xl backdrop-blur-md transition duration-200 group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => seekYouTubeBy(-10)}
              className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:bg-white/20"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={() => seekYouTubeBy(10)}
              className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:bg-white/20"
            >
              +10s
            </button>
            {[1, 1.3, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeYouTubeRate(rate)}
                className={`rounded-full px-3 py-2 text-[11px] font-bold transition ${
                  playbackRate === rate ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
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
