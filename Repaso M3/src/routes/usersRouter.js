const { Router } = require('express')
const { createUser, getUsers, getUserByName, getUserById } = require('../controllers/controllers')

const usersRouter = Router()

usersRouter.post('/',(req,res)=>{
    //recibiremos los datos x body
    const { name, lastname, email, age } = req.body

    if(!name || !lastname || !email || !age) return res.status(400).json({error:'los datos deben estar completos'})

    const newUser = createUser(name,lastname,email,age)

    res.status(200).json(newUser)

})

usersRouter.get('/',(req,res)=>{
    //validar si tengo que buscar x nombre o traer todos los usuarios.
    const { name } = req.query
    if(name){
        const users = getUserByName(name)
        if(users['error']) return res.status(400).json(users)
        else return res.status(200).json(users)
    }
    else {
        const users = getUsers()
        return res.status(200).json(users)
    }
})

usersRouter.get('/:id',(req, res)=>{
    const { id } = req.params

    console.log(typeof id)
    const user = getUserById(id) 
    if(user['error']) return res.status(400).json(user)
    else res.status(200).json(user)
})

module.exports = usersRouter