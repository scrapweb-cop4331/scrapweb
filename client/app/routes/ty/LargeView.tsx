import type { EntryItem } from "./data";

export type LargeViewProps =  EntryItem & {

}

export const LargeView = ({
      date,
  imageURL,
}: LargeViewProps) => {
    return (
        <p className="large-view">Hello, world</p>
    )
}

export default LargeView