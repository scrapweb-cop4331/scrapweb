import { Video, Frame } from "@react95/core";
import Audio from "~/components/ui/common/Audio";

export default function IDKRoute() {
    return (
      <>
        {/* <video height="320px" src="/app/assets/test.mp4"></video> */}
        <Frame bgColor="$material" w="320px" margin="60px" padding="2px">

        <Audio  src="/app/assets/luckystar.mp3"></Audio>
        </Frame>

        <Video w="320px" src="/app/assets/test.mp4"></Video>
      </>
    );
}