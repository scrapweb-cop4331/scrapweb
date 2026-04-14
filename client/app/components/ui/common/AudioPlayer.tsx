import { Button, Frame } from "@react95/core";
import { useState, useRef, useEffect } from "react";

function useAudioPlayer(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  const seek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  return { playing, toggle, progress, seek, duration, fmt, hasAudio: !!src };
}

function ProgressBar({
  progress,
  onSeek,
  disabled,
}: {
  progress: number;
  onSeek: (r: number) => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const getRatio = (clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(true);
    onSeek(getRatio(e.clientX));
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => onSeek(getRatio(e.clientX));
    const onUp = (e: MouseEvent) => {
      onSeek(getRatio(e.clientX));
      setDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, onSeek]);

  const pct = `${progress * 100}%`;

  return (
    <div
      ref={trackRef}
      onMouseDown={handleMouseDown}
      style={{
        flex: 1,
        height: "18px",
        position: "relative",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Frame
        boxShadow="in"
        style={{
          width: "100%",
          height: "6px",
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: pct,
            height: "100%",
            background: disabled ? "#aaa" : "#000080",
          }}
        />
      </Frame>
      {!disabled && (
        <div
          style={{
            position: "absolute",
            left: pct,
            transform: "translateX(-50%)",
            width: "12px",
            height: "18px",
            background: "#c0c0c0",
            border: "2px solid",
            borderColor: "#ffffff #808080 #808080 #ffffff",
            boxSizing: "border-box",
            cursor: "ew-resize",
            zIndex: 2,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
}

export type AudioPlayerProps = {
  audioURL: string;
};

export default function AudioPlayer({ audioURL }: AudioPlayerProps) {
  const player = useAudioPlayer(audioURL);
  return (
    <div
      style={{
        width: "220px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #808080",
          borderBottom: "1px solid #fff",
          margin: "0",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Button
            onClick={player.toggle}
            disabled={!player.hasAudio}
            style={{
              minWidth: "32px",
              padding: "2px 4px",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            {player.playing ? "⏸" : "▶"}
          </Button>
          <span
            style={{
              fontSize: "10px",
              color: "#444",
              flexShrink: 0,
              fontFamily: "monospace",
            }}
          >
            {player.hasAudio
              ? player.fmt(player.progress * player.duration)
              : "0:00"}
          </span>
          <ProgressBar
            progress={player.progress}
            onSeek={player.seek}
            disabled={!player.hasAudio}
          />
          <span
            style={{
              fontSize: "10px",
              color: "#444",
              flexShrink: 0,
              fontFamily: "monospace",
            }}
          >
            {player.hasAudio ? player.fmt(player.duration) : "0:00"}
          </span>
        </div>
        {!player.hasAudio && (
          <div
            style={{
              fontSize: "10px",
              color: "#999",
              fontStyle: "italic",
              paddingLeft: "2px",
            }}
          >
            No audio file
          </div>
        )}
      </div>
    </div>
  );
}
