"use client";

let apiReady: Promise<void> | null = null;

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        CUED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (videoId: string) => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
  mute: () => void;
  destroy: () => void;
};

function loadYouTubeAPI() {
  if (apiReady) return apiReady;
  apiReady = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return apiReady;
}

export async function createYouTubePlayer(
  container: HTMLElement,
  videoId: string,
  callbacks: {
    onEnded?: () => void;
    onPlayingChange?: (playing: boolean) => void;
  },
  options?: { autoplay?: boolean }
): Promise<YTPlayer> {
  await loadYouTubeAPI();
  const autoplay = options?.autoplay ?? false;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return new Promise((resolve) => {
    const player = new window.YT!.Player(container, {
      videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        start: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin,
      },
      events: {
        onReady: (e) => {
          e.target.setVolume(100);
          e.target.mute();
          resolve(e.target);
        },
        onStateChange: (e) => {
          const { ENDED, PLAYING, PAUSED, BUFFERING } = window.YT!.PlayerState;
          if (e.data === ENDED) callbacks.onEnded?.();
          if (e.data === PLAYING || e.data === BUFFERING) {
            e.target.setVolume(100);
            e.target.unMute();
            callbacks.onPlayingChange?.(true);
          }
          if (e.data === PAUSED) {
            callbacks.onPlayingChange?.(false);
          }
        },
      },
    });
    void player;
  });
}

export function playYouTubeFromStart(player: YTPlayer, options?: { muted?: boolean }) {
  player.setVolume(100);
  if (options?.muted) player.mute();
  else player.unMute();
  player.seekTo(0, true);
  player.playVideo();
}

export function resumeYouTube(player: YTPlayer) {
  player.setVolume(100);
  player.unMute();
  player.playVideo();
}

export function unmuteYouTube(player: YTPlayer) {
  player.setVolume(100);
  player.unMute();
}

export function loadYouTubeTrack(player: YTPlayer, videoId: string) {
  player.loadVideoById(videoId);
  player.setVolume(100);
  player.unMute();
  player.seekTo(0, true);
  player.playVideo();
}
