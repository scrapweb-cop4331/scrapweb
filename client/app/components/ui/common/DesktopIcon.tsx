import { Computer } from "@react95/icons";

interface DesktopIconProps {
  onClick: () => void;
}

export function DesktopIcon({ onClick }: DesktopIconProps) {
  return (
    <button className="desktop-icon" onClick={onClick}>
      <img src={"/app/assets/logo-icon.png"} alt="" />
      <span className="desktop-icon-label">Scrapweb</span>
    </button>
  );
}
