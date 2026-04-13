import { Video, Frame } from "@react95/core";
import Audio from "~/components/ui/common/Audio";
import LargeView from "./index/LargeView";
import type { EntryItem } from "./index/data";

export default function IDKRoute() {
  const foo: EntryItem = {
          id: "h",
          imageURL: "/app/assets/logo_worded.png",
          timestamp: 1,
          note: "important words",
          audioURL: "http://137.184.93.240/api/media/file/69dd34fcb8a590eed30b2bfa",
          date: "hah it doesnt have to be a date",
        }
  
    return (
      <>
        {/* <video height="320px" src="/app/assets/test.mp4"></video> */}
        <Frame bgColor="$material" w="320px" margin="60px" padding="2px">
          <Audio src="/app/assets/luckystar.mp3"></Audio>
        </Frame>

        <LargeView {...foo}></LargeView>
        <Video w="320px" src="/app/assets/test.mp4"></Video>
      </>
    );
}