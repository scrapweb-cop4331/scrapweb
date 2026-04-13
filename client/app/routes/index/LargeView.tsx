import type { EntryItem } from "./data";
import Audio from "~/components/ui/common/Audio";

export type LargeViewProps = EntryItem;

export const LargeView = (props: LargeViewProps) => {
    console.log(props!.audioURL);
    console.log("hi\n\n\n\n\n");
  return (
    <>
      {props.isInvalid ? (
        <p>Select an entry.</p>
      ) : (
        <>
          <div className="largeview-section">
            <div className="largeview-header">
              <p className="largeview-date">{props!.date}</p>
              <img src={props!.imageURL} alt="selected entry"></img>
            </div>
            <p>
              {props!.note}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <div className="audio-player-container">
            <Audio src={props!.audioURL}></Audio>
          </div>
        </>
      )}
    </>
  );
};

export default LargeView;
