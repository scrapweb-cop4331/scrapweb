import { Computer } from "@react95/icons";

interface DesktopIconProps {
  onClick: () => void;
}

export function DesktopIcon({ onClick }: DesktopIconProps) {
  return (
    <button className="desktop-icon" onClick={onClick}>
      <Computer variant="32x32_4" />
      <span className="desktop-icon-label">Scrapweb</span>
    </button>
  );
}
