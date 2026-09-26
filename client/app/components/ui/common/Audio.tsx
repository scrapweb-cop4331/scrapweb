import React, { useState, useRef, useEffect } from 'react';
import { Button, Range } from '@react95/core';
import { Playp16 } from '@react95/icons';
import './Audio.css';

export interface AudioProps {
  src: string;
  audioProps?: React.AudioHTMLAttributes<HTMLAudioElement>;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export function Audio({ src, audioProps }: AudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  return (
    <div className="audio-container">
      <div className="audio-count-down-container">
        <span className="audio-font audio-current-time" data-testid="audio-timer">
          {formatTime(currentTime)}
        </span>
      </div>
      <div className="audio-controls">
        <Button onClick={togglePlay} className="audio-control-btn" data-testid="play-pause-btn">
          {isPlaying ? (
            <div style={{ display: 'flex', gap: '2px' }}>
              <div style={{ width: '3px', height: '10px', background: 'black' }} />
              <div style={{ width: '3px', height: '10px', background: 'black' }} />
            </div>
          ) : (
            <Playp16 variant="16x16_4" />
          )}
        </Button>
        <Button onClick={handleStop} className="audio-control-btn" data-testid="stop-btn">
          <div className="audio-stop-icon" />
        </Button>
        <Range
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleScrub}
          className="audio-range"
        />
      </div>
      <audio
        ref={audioRef}
        src={src}
        className="audio-element"
        {...audioProps}
      />
    </div>
  );
}

export default Audio;
