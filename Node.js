function saludo(nombre) {
  return `Hola ${nombre}`;
}

function saludarHolaMundo(nombre) {
  return `Hola Mundo ${nombre}`;
}

console.log(saludo());

module.exports = {
  saludo,
  saludarHolaMundo,
};
