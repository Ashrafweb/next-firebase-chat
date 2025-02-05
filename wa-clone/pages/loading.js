import { Circle } from "@mui/icons-material";

function Loading() {
  return (
    <center style={{ display: "grid", placeItems: "center", height: "100vh" }}>
      <div>
        <img
          src="https:\\assets.stickpng.com/images/580b57fcd9996e24bc43c543.png"
          alt="logo"
          style={{ marginBottom: 10 }}
          height={100}
        />
        <Circle color="#3cbc28" size={60} />
      </div>
    </center>
  );
}

export default Loading;
