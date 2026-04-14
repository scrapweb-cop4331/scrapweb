import type { EntryItem } from "../utils/data";
import AudioPlayer from "~/components/ui/common/AudioPlayer";
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
