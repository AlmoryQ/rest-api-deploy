const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const moviesJSON = require('./movies.json')
const {validateMovie, validaPartialMovie} = require('./schemas/movies')

const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
        'https://midu.dev'
      ]
  
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
  
      if (!origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
  }))

app.get('/',(req,res)=>{
    res.json({message:'Bienvenido'})
})
//Todos los que sean movies
app.get('/movies',(req,res)=>{
    const {genre} = req.query
    if(genre){
        const filteredMovies = moviesJSON.filter(
                movie => movie.genre.some(g=>g.toLocaleLowerCase()===genre.toLocaleLowerCase())
            )
        return res.json(filteredMovies)
    }
    res.json(moviesJSON)
})
//PELICULA POR ID
app.get('/movies/:id',(req,res)=>{
    const {id} = req.params
    const movie = moviesJSON.find(movie => movie.id === id)
    if(movie){
        res.json(movie)
    }else{
        res.json({message:'Not found - 404'})
    }
})

app.post("/movies",(req,res)=>{
    const result = validateMovie(req.body)

    if(result.error){
        return res.status(400).json({error:JSON.parse(result.error.message)})
    }
    const newMovie = {
        id:crypto.randomUUID(),
        ...result.data
    }
    moviesJSON.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id',(req,res)=>{
    const {id} = req.params
    const movieIndex = moviesJSON.findIndex(movie=>movie.id === id)

    console.log('movieIndex',movieIndex)

    if(movieIndex === -1){
        return res.status(404).json({message:'Movie not found'})
    }

    moviesJSON.splice(movieIndex,1)

    return res.json({message:'Movie deleted'})
})

app.patch('/movies/:id',(req,res)=>{
    
    const result = validaPartialMovie(req.body)

    if(!result.success){
        return res.status(400).json({error:JSON.parse(result.error.message)})
    }

    const {id} = req.params
    const movieIndex = moviesJSON.findIndex(movie=>movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({message:'Movie not found'})
    }

    const updateMovie = {
        ...moviesJSON[movieIndex],
        ...result.data
    }
    moviesJSON[movieIndex] = updateMovie

    return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT,()=>{
    console.log(`server listening on port http://localhost:${PORT}`)
})