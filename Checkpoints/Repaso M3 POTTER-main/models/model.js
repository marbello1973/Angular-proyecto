///==========================================================================///
///===============================HENRY-POTTER===============================///
///==========================================================================///

"use strict";

var characters = [];

var houses = [];

module.exports = {
  reset: function () {
    // No es necesario modificar esta función (Ya está completa)
    characters = [];
    houses = [];
  },
  // ==== COMPLETEN LAS SIGUIENTES FUNCIONES (vean los test de `model.js`) =====
  listCharacters: function (house, fullName) {
    // Devuelve un arreglo con todos los personajes
    // Si recibe un nombre de house como parámetro debería filtrar solo los personajes de ella
    // Si recibe un segundo parámetro en true debe devolver únicamente los nombres y apellidos de los personajes

    /* var personajes = [];
    if (house && fullname === true) {
      personajes = characters.filter(
        (char) => char.houseId === houseId.indexOf(house) + 1
      );
      personajes = personajes.map((char) => char.name + " " + char.lastName);
    } else {
      characters.push(personajes);
    }
    return characters; */

    /* let id = houses.indexOf(house) + 1;

    if (house && !fullName) {
      return characters.filter((character) => characters.houseId === id);
    } else if (house && fullName) {
      if (fullName) {
        let filteredCharacters = characters.filter(
          (character) => characters.houseId === id
        );
        let mappedCharacters = filteredCharacters.map(
          (character) => character.name + " " + character.lastName
        );
        return mappedCharacters;
      }
    }
    return characters; */

    let list = [];
    if (house) {
      list = characters.filter(
        (char) => char.houseId === houses.indexOf(house) + 1
      );
      if (fullName === true) {
        list = list.map((char) => char.name + " " + char.lastName);
      }
    } else {
      list = characters;
    }
    return list;
  },

  addHouse: function (house) {
    // Agrega el nombre de una nueva casa verificando que no exista
    // Debe retornar el nombre de la casa agregado o existente
    /* if (!house.includes(house)) {
      houses.push(house);
    }
    return house; */
    if (houses.indexOf(house) === -1) {
      houses.push(house);
    } else if (houses.indexOf(house) > -1) {
      return {
        message: "House no existe",
      };
    }
    return house;
  },

  listHouses: function () {
    // Devuelve un arreglo con todas las casas
    return houses;
  },

  addCharacter: function (name, lastName, house, dateOfBirth, isMuggle) {
    // Agrega un nuevo personaje, inicialmente su propiedad wand (varita) debe ser un objeto vacío
    // Adicionalmente va a ser necesario guardar, en su propiedad houseId, el número (id) de la casa y no su nombre
    // (que es lo que recibimos por parámetros)
    // El número de casa debe empezar desde 1 y no desde 0.
    // su propiedad spells (hechizos) será inicialmente un arreglo vacío
    // su propiedad yearOfBirth debe ser un número (pista: podemos sacarla de dateOfBirth)
    // si el nombre de la casa no esta en el arreglo de casas:
    // no debe agregarse el personaje al arreglo de personajes y debe devolver un objeto con un mensaje de error,
    // (mirar en los tests)
    // Si la casa existe y el personaje es agregado con éxito debe retornar el personaje creado
    let id = houses.indexOf(house) + 1;
    if (id < 1) {
      return { message: "No existe una casa con ese nombre" };
    } else {
      let character = {
        name: name,
        lastName: lastName,
        houseId: id,
        dateOfBirth: dateOfBirth,
        isMuggle: isMuggle,
        yearOfBirth: parseInt(dateOfBirth.substr(dateOfBirth.length - 4)),
        spells: [],
        wand: {},
      };
      characters.push(character);
      return character;
    }
  },

  addSpell: function (name, id, spellName, description) {
    // recibe el nombre de un personaje, id del hechizo, nombre del hechizo y descripción del hechizo
    // debe encontrar en el arreglo de personajes al personaje que matchee con el nombre
    // recibido por parametro y debe agregar a su propiedad spells un nuevo objeto hechizo de la forma:
    //{id: id, spellName: spellName, description: description}
    // una vez agregado el hechizo debe retornar un objeto con un mensaje de éxito (ver el test de las rutas)
    // Si no se le pasa id, spellName o description no agrega el hechizo al personaje
    let charID = characters.indexOf(characters.find((e) => e.name === name));
    let spell = {
      id,
      spellName,
      description,
    };
    if (id && spellName && description && charID >= 0) {
      characters[charID].spells.push(spell);
      return { success: "Success adding spell" };
    }
  },

  showSpells: function (name) {
    // Devuelve todos los hechizos de un personaje en particular
    // Si no encuentra al personaje que matchee con el nombre recibido por parámetros
    // devuelve un arreglo vacío
    for (let i = 0; i < characters.length; i++) {
      if (characters[i].name === name) {
        return characters[i].spells;
      }
    }
    return [];
  },

  addWand: function (name, wood, core, length) {
    // Recibe : nombre de personaje (name), material de la varita (wood), núcleo de la varita (core) y largo de la varita (length)
    // Debe encontrar el personaje que matchee con el nombre recibido
    // Si no encuentra ningun personaje que matchee debe devolver un arreglo vacío
    // Si lo encuentra pero ese personaje YA TIENE asignada una varita en su propiedad "wand" debe devolver el siguiente string:
    // "Ya existe una varita para este personaje"
    // caso contrario debe agregar a la propiedad wand del personaje un objeto de la siguiente forma
    // {wood: wood, core: core, length: length}
    let charID = characters.indexOf(
      characters.find((element) => element.name === name)
    );
    let wand = {
      name,
      wood,
      core,
      length,
    };
    if (charID < 0) return [];
    if (charID >= 0 && characters[charID].wand.length > 0)
      return "Ya existe una varita para este personaje";
    if (wood && core && length && charID >= 0) {
      characters[charID].wand = wand;
      return "varita agregada";
    }
  },

  showWand: function (name) {
    // Devuelve la varita de un personaje en particular
    // Si no encuentra al personaje que matchee con el nombre recibido por parámetros devuelve un arreglo vacío
    // Si el personaje en cuestión no tiene varita devuelve el string "el personaje no tiene varita"
    let char = characters.find((element) => element.name === name);
    if (!char) return [];
    if (!Object.keys(char.wand).length) return "el personaje no tiene varita";
    return char.wand;
  },
};
