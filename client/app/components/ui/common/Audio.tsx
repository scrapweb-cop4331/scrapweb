import React, { forwardRef, useState, useRef, useImperativeHandle, useEffect } from "react";
import { Frame, Button, Range } from "@react95/core";
import { Playd16, Playp16 } from "@react95/icons";
import classNames from "classnames";
import "./Audio.css";

export type AudioProps = {
  src: string;
  name?: string;
  autoPlay?: boolean;
};

export type AudioRefs = {
  audio: React.RefObject<HTMLAudioElement | null>;
  progress: React.RefObject<HTMLInputElement | null>;
  playpause: React.RefObject<HTMLButtonElement | null>;
  stop: React.RefObject<HTMLButtonElement | null>;
};

function parseCurrentTime(secs: number) {
  if (!secs || isNaN(secs)) {
    return "00:00";
  }
  const sec = parseInt(secs.toString(), 10);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor(sec / 60) % 60;
  const seconds = sec % 60;
  return [hours, minutes, seconds].map((v) => v < 10 ? `0${v}` : v).filter((v, i) => v !== "00" || i > 0).join(":");
}

const Audio = forwardRef<AudioRefs, AudioProps>(({ src, autoPlay = false }, ref) => {
  const [playing, setPlaying] = useState(false);
  const [loadeddata, setLoadeddata] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const playPauseRef = useRef<HTMLButtonElement>(null);
  const stopRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    audio: audioRef,
    progress: progressRef,
    playpause: playPauseRef,
    stop: stopRef,
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when src changes
    setLoadeddata(audio.readyState >= 3);
    setPlaying(!audio.paused);

    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    const onTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const percentage = Math.floor(100 / audio.duration * audio.currentTime);
        setProgress(percentage);
      }
    };

    const onLoadedData = () => {
      setLoadeddata(true);
    };

    const onPlaying = () => {
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!playing) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="audio-container">
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        className="audio-element"
      />
      
      <div className="audio-count-down-container">
        <Frame display="flex" flexDirection="column" w="40%">
          <div className="audio-font audio-duration">
            {audioRef.current && parseCurrentTime(audioRef.current.duration)}
          </div>
          <div className="audio-font audio-opening-text">
            {!loadeddata && "Opening"}
          </div>
        </Frame>
        
        <Frame display="flex" flexDirection="column" w="40%">
          <div className={classNames("audio-font", "audio-current-time")}>
            {audioRef.current && parseCurrentTime(audioRef.current.currentTime)}
          </div>
          <div className={classNames("audio-font", "audio-elapsed-time")}>
            time
          </div>
        </Frame>
      </div>

      <div className="audio-controls">
        <Button
          className={classNames("audio-control-btn", { active: playing })}
          disabled={!loadeddata}
          onClick={togglePlay}
          ref={playPauseRef}
        >
          {playing ? <Playp16 /> : <Playd16 />}
        </Button>

        <Button
          className="audio-control-btn"
          disabled={!loadeddata}
          onClick={stop}
          ref={stopRef}
        >
          <div className="audio-stop-icon" />
        </Button>

        <Range
          className="audio-range"
          ref={progressRef}
          min="0"
          max="100"
          step="1"
          value={progress}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (audioRef.current && audioRef.current.duration) {
              const value = parseInt(e.target.value);
              const percent = value / 100;
              audioRef.current.currentTime = percent * audioRef.current.duration;
              setProgress(value);
            }
          }}
        />
      </div>
    </div>
  );
});

Audio.displayName = "Audio";

export default Audio;
