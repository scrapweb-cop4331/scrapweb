import { Frame } from "@react95/core";
export interface EntryButtonProps {
  date: string;
  imageURL: string;
  isActive: boolean;
  onClick: () => void;
}

const EntryButton = ({
  date,
  imageURL,
  isActive,
  onClick,
}: EntryButtonProps) => {
  console.log({
    date,
    imageURL,
    isActive,
    onClick
  })
  return (
    <>
      <Frame
        as="button"
        onClick={onClick}
        boxShadow={isActive ? "$in" : "$out"}
        className={`entry-button ${isActive ? "active" : ""}`}
      >
        <Frame boxShadow="$in" className="entry-image-frame">
          <img src={imageURL} className="entry-image" />
        </Frame>
        <label className="entry-label">{date}</label>
      </Frame>
    </>
  );
};

export default EntryButton;
