import { GameServer } from "./gameserver.js";
import express from "express";

const app = express();
const PORT = 3000;
app.use(express.static("public"));
app.use("/shared", express.static("shared"));
app.use(express.json());

app.get("/serverid", (req, res) => {
  res.json({ id: GameServer.getGameID() });
});

app.listen(PORT, () => {
  console.log(`local server URL: localhost:${PORT}`);
});
