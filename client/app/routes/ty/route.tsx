import "./styles.css"
import { Button } from "@react95/core"
import MyButton from "./MyButton"
export default () => (
    <div className="flex items-center h-screen w-screen justify-center p-10">
        <Button className="size-40">

            <label className="text-lg">Hello, world</label>
        </Button>
        <MyButton></MyButton>
    </div>
)