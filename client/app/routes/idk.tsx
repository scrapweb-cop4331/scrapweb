import { Frame } from "@react95/core";
import AudioPlayer from "~/components/ui/common/AudioPlayer";
export default function Idk() {
  // return <h1>Hello, world</h1>
  return (
    <Frame
      height="30vh"
      width="30vw"
      bgColor="$material"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >

      <AudioPlayer audioURL="https://scrapweb.kite-keeper.com/api/media/file/69de4e2cc2237b5e67495ca6" />
    </Frame>
  );
}
