var express = require("express");
const { listeners } = require("process");
var app = express();

app.get("/hola", (req, res) => {
  res.send("hola");
});

app.listen(3000);
