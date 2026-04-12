import { useParams } from "react-router";

const EditRoute = () => {
  const { id } = useParams();
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh"
      }}
    >
      <h1>{id}</h1>
    </div>
  );
};
export default EditRoute;
