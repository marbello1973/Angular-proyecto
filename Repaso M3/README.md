# Repaso M3

## Pasos a tener en cuenta

1. Crear nuestro package.json
2. Instalar: express, nodemon, morgan
3. Configuramos package.json para nodemon
4. Levantar el servidor...
5. Crear una carpeta llamada src
    dentro de esta carpeta el archivo de nuestras rutas -> app.js

Requerimientos:

## Ruta USERS
1- Ruta GET '/users' me traiga todos los usuarios o que me busque por nombre, este nombre deben recibirlo por query.
2- Ruta GET '/users/:id' me traiga solo el usuario que corresponda a ese ID.
3. Ruta POST '/users' para crear un nuevo usuario.
4. Ruta PUT '/users' para modificar un usuario existente
5. Ruta DELETE '/users/:id' para eliminar un usuario existente.

## Ruta POSTEOS 
1- Ruta GET '/posts' que me traiga todos los posteos
2- Ruta GET '/posts/:id' que me traiga el posteo que corresponda a ese ID
3- Ruta POST '/posts' que cree un posteo (el usuario debe crear ese post)
4. Ruta PUT '/posts' para modificar el posteo.
5. Ruta DELETE '/posts/:id' para eliminar un posteo

