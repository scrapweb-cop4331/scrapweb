import { expect, test, vi } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import Audio from "./Audio";

test("Audio snapshot", () => {
  const { asFragment } = render(<Audio src="test.mp3" />);
  expect(asFragment()).toMatchSnapshot();
});

test("Play button stays pressed while playing", async () => {
  // Mock HTMLMediaElement.prototype.play and pause
  const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

  // Create a mock audio element with readyState >= 3 so button is enabled
  Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
    configurable: true,
    get() { return 4; }
  });

  const { asFragment } = render(<Audio src="test.mp3" />);

  const playButton = screen.getAllByRole("button")[0];
  const audioElement = document.querySelector('audio') as HTMLAudioElement;

  // Simulate clicking play
  fireEvent.click(playButton);
  
  // Simulate the 'playing' event that the component listens to
  await act(async () => {
    audioElement.dispatchEvent(new Event('playing'));
  });

  // Snapshot should show the active state
  expect(asFragment()).toMatchSnapshot("playing");

  // Simulate clicking pause
  fireEvent.click(playButton);
  
  // Simulate the 'pause' event
  await act(async () => {
    audioElement.dispatchEvent(new Event('pause'));
  });

  expect(asFragment()).toMatchSnapshot("paused");

  playSpy.mockRestore();
  pauseSpy.mockRestore();
});
