
var familias = [];
// var id = 1;
const addCharacter = function (name, age, familia) {
	// body...
	let id = familias.indexOf(familia) + 1	
	if(id < 1){
		return {
			message:"no existe familia"
		}
	}else {
		let character = {								
			name:name,
			age:age,
			familia:familia
		}

		familias.push(character)

	}
	return familias
}

console.log(addCharacter("david", 34, "marbello"))
console.log(addCharacter("maria jose", 34, "marbello"))
console.log(addCharacter("karla", 34, "perez"))
console.log(addCharacter("joel", 34, "zabala"))
addCharacter()


const getUserById = (id) => {
	const resultado = users.find(user => user.id === id)
	if(resultado) return resultado
	return {error: `${resultado} id no encontrado`}
}
