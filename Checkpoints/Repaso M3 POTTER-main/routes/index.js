"use strict";

const { json } = require("body-parser");
var express = require("express");

var router = express.Router();
module.exports = router;
const {
  addHouse,
  listHouses,
  listCharacters,
  addCharacter,
  showSpells,
  addSpell,
  showWand,
  addWand,
} = require("../models/model");

// escriban sus rutas acá
// siéntanse libres de dividir entre archivos si lo necesitan

router.get("/houses", (req, res) => {
  res.status(200).json(listHouses());
});

router.post("/houses", (req, res) => {
  const { house } = req.body;
  res.status(200).json(addHouse(house));
});

router.get("/characters", (req, res) => {
  res.status(200).json(listCharacters());
});

router.post("/characters", (req, res) => {
  const { name, lastName, house, dateOfBirth, isMuggle } = req.body;
  const resultado = addCharacter(name, lastName, house, dateOfBirth, isMuggle);
  if (resultado.message) {
    res.status(404).json({ msg: "La casa ingresada no existe" });
  } else {
    res.status(200).json(resultado);
  }
});

router.get("/characters/:houseName", (req, res) => {
  let { houseName } = req.params;
  let { fullName } = req.query;
  fullName && fullName.includes("true")
    ? (fullName = true)
    : (fullName = false);
  const char = listCharacters(houseName, fullName);
  res.status(200).json(char);
});

router.get("/spells", (req, res) => {
  const { name } = req.query;
  const spells = showSpells(name);
  res.status(200).json(spells);
});

router.post("/spells", (req, res) => {
  const { name, id, spellsName, description } = req.body;
  const nSpell = addSpell(name, id, spellsName, description);
  res.status(201).json(nSpell);
});

router.get("/wand", (req, res) => {
  const { name } = req.body;
  const wand = showWand(name);
  res.status(200).json(wand);
});

router.post("/wand", (req, res) => {
  const { name, wood, core, length } = req.body;
  const wand = addWand(name, wood, core, length);
  res.status(201).json(wand);
});
