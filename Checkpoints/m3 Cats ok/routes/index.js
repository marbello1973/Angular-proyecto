"use strict";

const express = require("express");
const controller = require("../controllers/controllers");
const router = express.Router();

// Escriban sus rutas acá
// Siéntanse libres de dividir entre archivos si lo necesitan

// Hint:  investigá las propiedades del objeto Error en JS para acceder al mensaje en el mismo.
module.exports = router;

router.get("/cats", (req, res) => {
  const request = controller.listCats();
  res.status(200).json(request);
});

router.post("/cats", (req, res) => {
  try {
    let { name } = req.body;
    controller.addCat(name);
    res
      .status(201)
      .json({ msg: "Exito", data: controller.listCats(null, name) });
  } catch (error) {
    let { name } = req.body;
    res.status(400).json({ error: `${name} already exists` });
  }
});

router.get("/accessories", (req, res) => {
  const { type, color } = req.query;
  const request = controller.getAccessories(type, color);
  res.status(200).json(request);
});

router.put("/accessories/:id", (req, res) => {
  const { type, color, description } = req.body;
  const { id } = req.params;
  let obj = {};
  if (id) obj.id = Number(id);
  if (type) obj.type = type;
  if (color) obj.color = color;
  if (description) obj.description = description;
  try {
    const request = controller.modifyAccessory(obj);
    let { id, type, color, description } = request;
    res.status(200).json({ id, type, color, description });
  } catch (error) {
    res.status(404).json({ error: "accesorio no encontrado" });
  }
});

router.post("/accessories", (req, res) => {
  const { id, color, type, description } = req.body;
  try {
    const request = controller.addAccessory({
      id,
      color,
      type,
      description,
    });
    res.status(201).json({ message: request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/accessories/:id", (req, res) => {
  try {
    const { id } = req.params;
    const request = controller.deleteAccessory(Number(id));
    res.status(200).json({ message: request });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/cats/accessories", (req, res) => {
  try {
    const { catName, catAccessoryId } = req.body;
    const request = controller.addCatAccessory(catName, catAccessoryId);
    res.status(200).json({ msg: "Exito" });
  } catch (error) {
    if (error.message === "Accesorio no encontrado")
      error.message = "accesorio no encontrado";
    res.status(404).json({ error: error.message });
  }
});
