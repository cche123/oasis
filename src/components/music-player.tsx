"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { OASIS_PLAYLIST, type PlaylistTrack } from "@/lib/playlist";
import {
  createYouTubePlayer,
  loadYouTubeTrack,
  playYouTubeFromStart,
  resumeYouTube,
  unmuteYouTube,
  type YTPlayer,
} from "@/lib/youtube-audio";

function isOnboardingPath(path: string) {
  return path.startsWith("/onboarding");
}

function isAppPath(path: string) {
  return path !== "/" && !path.startsWith("/onboarding");
}

type BarPlacement = "onboarding" | "sidebar";

type MusicPlayerContextValue = {
  track: PlaylistTrack;
  playing: boolean;
  barPlacement: BarPlacement | null;
  togglePlay: () => void;
  prevTrack: () => void;
  nextTrack: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("useMusicPlayer must be used within MusicPlayer");
  }
  return ctx;
}

function MusicPlayerControls({ className }: { className?: string }) {
  const { track, playing, togglePlay, prevTrack, nextTrack } = useMusicPlayer();

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border px-2 py-2 shadow-md",
        className
      )}
    >
      <div
        className="w-8 h-8 shrink-0 border border-border/60"
        style={{ background: track.gradient }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-foreground truncate leading-tight">
          {track.title}
        </p>
        <p className="text-[9px] text-muted-foreground truncate uppercase tracking-wide">
          {track.artist}
        </p>
      </div>
      <button
        type="button"
        onClick={prevTrack}
        className="w-7 h-7 flex items-center justify-center border border-border shrink-0 hover:border-foreground"
        aria-label="Previous"
      >
        <SkipBack className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={togglePlay}
        className="w-7 h-7 flex items-center justify-center bg-foreground text-background shrink-0"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>
      <button
        type="button"
        onClick={nextTrack}
        className="w-7 h-7 flex items-center justify-center border border-border shrink-0 hover:border-foreground"
        aria-label="Next"
      >
        <SkipForward className="w-3 h-3" />
      </button>
    </div>
  );
}

export function MusicPlayerBar({ placement }: { placement: BarPlacement }) {
  const { barPlacement } = useMusicPlayer();

  if (barPlacement !== placement) return null;

  if (placement === "sidebar") {
    return (
      <div className="px-3 pb-3">
        <MusicPlayerControls className="bg-muted/40 shadow-none" />
      </div>
    );
  }

  return null;
}

export function MusicPlayer({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const initializingRef = useRef(false);
  const modeRef = useRef<"mp3" | "youtube">("youtube");
  const hasStartedRef = useRef(false);
  const userPausedRef = useRef(false);
  const pendingStartRef = useRef(false);
  const startingRef = useRef(false);
  const onboardingAutostartRef = useRef(false);
  const trackIndexRef = useRef(0);

  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  trackIndexRef.current = trackIndex;

  const track: PlaylistTrack = OASIS_PLAYLIST[trackIndex];
  const barVisible = armed || playerReady;
  const barPlacement: BarPlacement | null = isOnboardingPath(pathname)
    ? barVisible
      ? "onboarding"
      : null
    : isAppPath(pathname) && barVisible
      ? "sidebar"
      : null;

  const playYouTubeAt = useCallback((index: number) => {
    const t = OASIS_PLAYLIST[index];
    const player = ytPlayerRef.current;
    if (!t.youtubeId || !player) return false;

    audioRef.current?.pause();
    loadYouTubeTrack(player, t.youtubeId);
    modeRef.current = "youtube";
    hasStartedRef.current = true;
    setArmed(true);
    userPausedRef.current = false;
    return true;
  }, []);

  const playMp3At = useCallback(async (index: number) => {
    const t = OASIS_PLAYLIST[index];
    if (!t.audioSrc) return false;

    const audio = audioRef.current;
    if (!audio) return false;

    try {
      const head = await fetch(t.audioSrc, { method: "HEAD" });
      if (!head.ok) return false;

      ytPlayerRef.current?.pauseVideo();
      audio.src = t.audioSrc;
      audio.load();
      audio.currentTime = 0;
      audio.volume = 0.85;
      await audio.play();
      modeRef.current = "mp3";
      hasStartedRef.current = true;
      setArmed(true);
      setPlaying(true);
      userPausedRef.current = false;
      return true;
    } catch {
      return false;
    }
  }, []);

  const ensurePlayer = useCallback(async () => {
    if (ytPlayerRef.current) return ytPlayerRef.current;
    if (initializingRef.current) {
      await new Promise<void>((resolve) => {
        const tick = () => {
          if (!initializingRef.current) {
            resolve();
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
      return ytPlayerRef.current;
    }

    const container = ytContainerRef.current;
    const videoId = OASIS_PLAYLIST[trackIndexRef.current].youtubeId ?? OASIS_PLAYLIST[0].youtubeId;
    if (!container || !videoId) return null;

    initializingRef.current = true;
    try {
      const player = await createYouTubePlayer(
        container,
        videoId,
        {
          onEnded: () => {
            const next = (trackIndexRef.current + 1) % OASIS_PLAYLIST.length;
            setTrackIndex(next);
            playYouTubeAt(next);
          },
          onPlayingChange: (isPlaying) => {
            if (userPausedRef.current && isPlaying) return;
            setPlaying(isPlaying);
            if (isPlaying) setArmed(true);
          },
        }
      );
      ytPlayerRef.current = player;
      setPlayerReady(true);
      return player;
    } finally {
      initializingRef.current = false;
    }
  }, [playYouTubeAt]);

  const playTrack = useCallback(
    async (index: number) => {
      setTrackIndex(index);
      trackIndexRef.current = index;

      const player = await ensurePlayer();
      if (player && OASIS_PLAYLIST[index].youtubeId) {
        playYouTubeAt(index);
        return;
      }

      await playMp3At(index);
    },
    [ensurePlayer, playMp3At, playYouTubeAt]
  );

  const beginPlayback = useCallback(async () => {
    if (userPausedRef.current || startingRef.current) return;

    setArmed(true);
    const player = await ensurePlayer();
    if (!player) {
      pendingStartRef.current = true;
      return;
    }

    if (hasStartedRef.current) {
      unmuteYouTube(player);
      resumeYouTube(player);
      return;
    }

    startingRef.current = true;
    pendingStartRef.current = false;

    const hadRecentGesture = sessionStorage.getItem("oasis-music-autoplay") === "1";
    if (hadRecentGesture) sessionStorage.removeItem("oasis-music-autoplay");

    playYouTubeFromStart(player, { muted: !hadRecentGesture });
    modeRef.current = "youtube";
    hasStartedRef.current = true;
    userPausedRef.current = false;

    if (!hadRecentGesture) {
      window.setTimeout(() => {
        if (userPausedRef.current || !ytPlayerRef.current) return;
        unmuteYouTube(ytPlayerRef.current);
      }, 400);
    }

    startingRef.current = false;
  }, [ensurePlayer]);

  const requestOnboardingStart = useCallback(() => {
    pendingStartRef.current = true;
    void beginPlayback();
  }, [beginPlayback]);

  useEffect(() => {
    void ensurePlayer();
  }, [ensurePlayer]);

  useEffect(() => {
    if (!playerReady || !pendingStartRef.current) return;
    if (!isOnboardingPath(pathname)) return;
    void beginPlayback();
  }, [playerReady, pathname, beginPlayback]);

  useEffect(() => {
    const onStart = () => {
      if (!isOnboardingPath(window.location.pathname)) return;
      requestOnboardingStart();
    };
    window.addEventListener("oasis-music-start", onStart);
    return () => window.removeEventListener("oasis-music-start", onStart);
  }, [requestOnboardingStart]);

  useEffect(() => {
    if (!isOnboardingPath(pathname)) {
      onboardingAutostartRef.current = false;
      return;
    }
    if (onboardingAutostartRef.current) return;
    onboardingAutostartRef.current = true;
    requestOnboardingStart();
  }, [pathname, requestOnboardingStart]);

  useEffect(() => {
    if (!isOnboardingPath(pathname)) return;

    const unlockAudio = () => {
      if (userPausedRef.current) return;
      void (async () => {
        const player = await ensurePlayer();
        if (!player) return;
        if (!hasStartedRef.current) {
          pendingStartRef.current = false;
          playYouTubeFromStart(player, { muted: false });
          modeRef.current = "youtube";
          hasStartedRef.current = true;
          setArmed(true);
          return;
        }
        unmuteYouTube(player);
        resumeYouTube(player);
      })();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("wheel", unlockAudio, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("wheel", unlockAudio);
    };
  }, [pathname, ensurePlayer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.85;

    const onEnded = () => {
      if (modeRef.current !== "mp3") return;
      const next = (trackIndexRef.current + 1) % OASIS_PLAYLIST.length;
      void playTrack(next);
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [playTrack]);

  const togglePlay = useCallback(() => {
    void (async () => {
      if (modeRef.current === "mp3") {
        const audio = audioRef.current;
        if (!audio?.src) {
          await playTrack(trackIndexRef.current);
          return;
        }
        if (playing) {
          audio.pause();
          userPausedRef.current = true;
          setPlaying(false);
        } else {
          userPausedRef.current = false;
          try {
            await audio.play();
            setPlaying(true);
          } catch {
            /* autoplay blocked */
          }
        }
        return;
      }

      const player = await ensurePlayer();
      if (!player) return;

      if (!hasStartedRef.current) {
        playYouTubeAt(trackIndexRef.current);
        return;
      }

      if (playing) {
        player.pauseVideo();
        userPausedRef.current = true;
        setPlaying(false);
      } else {
        userPausedRef.current = false;
        resumeYouTube(player);
        setPlaying(true);
      }
    })();
  }, [ensurePlayer, playTrack, playYouTubeAt, playing]);

  const prevTrack = useCallback(() => {
    const prev = (trackIndexRef.current - 1 + OASIS_PLAYLIST.length) % OASIS_PLAYLIST.length;
    void playTrack(prev);
  }, [playTrack]);

  const nextTrack = useCallback(() => {
    const next = (trackIndexRef.current + 1) % OASIS_PLAYLIST.length;
    void playTrack(next);
  }, [playTrack]);

  const contextValue = useMemo(
    () => ({ track, playing, barPlacement, togglePlay, prevTrack, nextTrack }),
    [track, playing, barPlacement, togglePlay, prevTrack, nextTrack]
  );

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <audio ref={audioRef} className="hidden" preload="none" />
      <div
        ref={ytContainerRef}
        className="fixed bottom-0 left-0 w-[1px] h-[1px] overflow-hidden opacity-0 pointer-events-none"
        aria-hidden
      />
      {barPlacement === "onboarding" && (
        <div className="fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 w-[min(280px,calc(100vw-2.5rem))] pointer-events-auto">
          <MusicPlayerControls />
        </div>
      )}
      {children}
    </MusicPlayerContext.Provider>
  );
}
