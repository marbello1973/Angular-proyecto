let users = []
let posts = []

let id = 1

const createUser = (name, lastname, email, age)=>{
    const newUser = {
        id:id++,
        name,
        lastname,
        email,
        age,
        posts:[]
    }

    users.push(newUser)
    return newUser

}

const getUsers = () =>{
    return users
}

const getUserByName = (name) => {
    const names = users.filter(user => user.name === name)

    if(names.length) return names
    return { error: "El usuario no existe" }
}

const getUserById = (id) => {
    const result = users.find(user => user.id === parseInt(id))
    if(result) return result
    return { error: 'Id no encontrado' }
}

let postId = 1
const addPost = (title, contents, userId) => {
    const user = users.find(user => user.id === parseInt(userId))

    if(!user) throw new Error('usuario no encontrado')
    const newPost = {
        id:postId++,
        title,
        contents,
        userId
    }
    posts.push(newPost)
    user.posts.push(newPost.id)

    return newPost

}

module.exports = {
    createUser,
    getUsers, 
    getUserByName,
    getUserById,
    addPost
}