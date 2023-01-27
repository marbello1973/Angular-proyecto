const e = require("express");
const json = require("./examples.json");

const agregarCiudad = (ciudad, codigo) => {
  if (utils.ciudades.find((e) => e.id === ciudad.id)) {
    throw new Error("No se puede agregar una ciudad ya existente");
  } else {
    utils.ciudades.push(ciudad);
  }
  let codePostal = utils.codigosPostales.find(
    (e) => e.codigoPostal === codigo.codigoPostal
  );
  console.log(codePostal);
  if (codePostal) {
    codePostal.ciudades.push(ciudad);
  } else {
    utils.codigosPostales.push({
      codigoPostal: codigo.codigoPostal,
      ciudades: [ciudad],
    });
  }
  return utils.ciudades;
};

agregarCiudad;
