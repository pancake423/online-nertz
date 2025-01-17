const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use("/shared", express.static(path.join(__dirname, "shared")));

app.listen(PORT, () => {
  console.log(`local server URL: localhost:${PORT}`);
});
