/// =========================================================================== ///
/// =============================== HENRY-CATS ================================ ///
/// =========================================================================== ///

"use strict";

let cats = [];
let accessories = [];

module.exports = {
  reset: function () {
    // No es necesario modificar esta función. La usamos para "limpiar" los arreglos entre test y test.

    cats = [];
    accessories = [];
  },

  // ==== COMPLETAR LAS SIGUIENTES FUNCIONES (vean los test de `controller.js`) =====

  addCat: function (name) {
    // Agrega un nuevo felin@, verificando que no exista anteriormente en base a su nombre.
    // En caso de existir, no se agrega y debe arrojar el Error ('El gato o gata ya existe') >> ver JS throw Error
    // Debe tener una propiedad <age> que inicialmente debe ser '1 year'.
    // Debe tener una propiedad <color> que inicialmente es un array vacío.
    // Debe tener una propiedad <accesories> que inicialmente es un array vacío.
    // El gato o gata debe guardarse como un objeto con el siguiente formato:
    // { name: name,  age: '1 year' , color: []}
    // En caso exitoso debe retornar el string '<nombre del gato o gata> fue creado correctamente'.
    const cat = cats.find((item) => item.name === name);
    if (cat) {
      throw new Error("El gato o gata ya existe");
    } else {
      cats.push({ name: name, age: "1 year", color: [], accessories: [] });
      return `${name} fue creado correctamente`;
    }
  },

  listCats: function (age, name) {
    // En caso de recibir el parámetro <age>, devuelve sólo los gatos correspondientes a dicho age.
    // Si no recibe parámetro, devuelve un arreglo con todos los gatos.
    if (name) return cats.find((item) => item.name === name);
    if (age) return cats.filter((item) => item.age === age);
    return cats;
  },

  addAccessory: function ({ id, color, type, description }) {
    // Agrega un nuevo accesorio.
    // Si el accesorio ya existe, no es agregado y arroja un Error ('El accesorio con el id <id> ya existe')
    // Debe devolver el mensaje 'El accesorio <type> fue agregado correctamente'
    // Inicialmente debe guardar la propiedad <popularity> del accesorio como 'low' por defecto
    // Si la descripción supera los 140 caracteres, debe arrojar un error
    let request = accessories.find((item) => item.id === id);
    if (request) throw new Error(`El accesorio con el id ${id} ya existe`);
    if (description.length > 140)
      throw new Error("La descripción supera los 140 caracteres");
    accessories.push({
      id: id,
      color: color,
      type: type,
      description: description,
      popularity: "low",
    });
    return `El accesorio ${color} ${type} fue agregado correctamente`;
  },

  getAccessories: function (type, color) {
    // Devuelve un array con todos los accesorios.
    // Si recibe parámetro "type", debe retornar  los accesorios que coincidan con el tipo.
    // Si recibe parámetro "color" debe retornar los accesorios que coincidan con el color
    // Si recibe ambos parámetros, se devuelven los accesorios que coincidan con el color o con el tipo
    if (type != null && color != null)
      return accessories.filter(
        (item) => !(item.type !== type && item.color !== color)
      );
    if (type) return accessories.filter((item) => item.type === type);
    if (color) return accessories.filter((item) => item.color === color);
    return accessories;
  },

  deleteAccessory: function (id) {
    // Elimina un accesorio del array
    // Si el id no existe dentro del array de accesorios, arrojar un Error ('El accesorio con el id <id> no fue encontrado')
    // Una vez eliminado el accesorio del array, devolver un mensaje que diga 'El accesorio con el id <id> fue eliminado correctamente'
    let request = accessories.find((item) => item.id === id);
    if (!request)
      throw new Error(`El accesorio con el id ${id} no fue encontrado`);
    accessories = accessories.filter((item) => item.id !== id);
    return `El accesorio con el id ${id} fue eliminado correctamente`;
  },

  modifyAccessory: function (obj) {
    // Modifica un accesorio del array
    // Si el id no existe dentro del array de accesorios arrojar un Error ('accesorio no encontrado')
    // Si el objeto viene vacio, arrojar un Error ('No se detectaron cambios a aplicar')
    // Una vez modificado el accesorio del array, devolver el accesorio modificado
    if (Object.entries(obj).length === 0)
      throw Error("No se detectaron cambios a aplicar");

    let indice = accessories.findIndex((item) => item.id === obj.id);
    if (indice < 0) throw Error("accesorio no encontrado");
    accessories[indice] = { ...accessories[indice], ...obj };
    return accessories[indice];
  },

  increaseAccesoryPopularity: function (accessoryId) {
    // ?Este método es complementario a 'addCatAccessory'
    // *Actualiza la propiedad <popularity> del accesorio,
    // *Para eso deberás comprobar cuantos gatos visten el accesorio recibido por parámetros (es un id)
    // *Si la cantidad de gatos que visten el accesorio son 2, entonces la popularidad del accesorio debe valer 'average'
    // *Si la cantidad de gatos que visten el accesorio son 3, entonces la popularidad del accesorio debe valer 'high'
    // *Si se actualizó la popularidad del accesorio, devolver true
    // *Si no se actualizó la popularidad del accesorio, debe devolver false

    let toy = accessories.find((item) => item.id === accessoryId);
    if (!toy) throw new Error("accesorio no encontrado");
    // ?Verificando con el reduce para obtener un unico valor numerico sobre cuantos gatos tienen el mismo accesorio
    let rating = cats.reduce((acum, item) => {
      if (item.accessories.some((item) => item.id === accessoryId))
        return acum + 1;
      return acum + 0;
    }, 0);

    if (rating === 2) {
      toy.popularity = "average";
      return true;
    }
    if (rating === 3) {
      toy.popularity = "high";
      return true;
    }
    return false;
  },

  addCatAccessory: function (catName, accessoryId) {
    // *Agrega un accesorio a un felin@
    // *Si el felin@ ya tiene puesto el accesorio, arrojar un Error('El gato <nombre_gato> ya tiene el accesorio puesto') y no lo agrega
    // *Si el gato no existe arrojar un Error ('El gato <nombre_gato> no existe')
    // *Si el id de accesorio no existe arrojar un Error ('accesorio no encontrado' y no actualiza la popularidad)
    let michi = cats.find((item) => item.name === catName);
    if (!michi) throw new Error(`El gato ${catName} no existe`);
    let toy = accessories.find((item) => item.id === accessoryId);
    if (!toy) throw new Error("Accesorio no encontrado");
    if (michi.accessories.some((item) => item.id === accessoryId))
      throw new Error(`El gato ${catName} ya tiene el accesorio puesto`);
    michi.accessories.push(toy);
    this.increaseAccesoryPopularity(accessoryId);
    return `El accesorio ${toy.type} fue agregado a ${catName} con exito`;
  },

  getAccessoryPopularity: function (accessoryId) {
    //Devuelve la popularidad de un accesorio
    let toy = accessories.find((item) => item.id === accessoryId);
    if (!toy) throw new Error("Accesorio no encontrado");
    return toy.popularity;
  },
};
