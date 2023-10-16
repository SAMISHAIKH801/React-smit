import express from 'express'
import cors from 'cors';
import path  from 'path';
import "dotenv/config"
const __dirname = path.resolve();




import authRouter from "./routes/auth.mjs"
import postRouter from "./routes/post.mjs"
import feedRouter from "./routes/feed.mjs"
import commentRouter from "./routes/comment.mjs"

const app = express()

app.use(express.json())

app.use(cors())

app.use(authRouter)

app.use((req, res, next) =>{
    let token = "valid"
    if(token === "valid"){
        // res.render
        next()
        
    }else{
        
        res.send({message: "invalid tokken"})
    }
    
})


app.use(postRouter)
app.use(feedRouter)
app.use(commentRouter)




// app.use(express.static(path.join(__dirname, 'static')))

// example.com
app.use("/static", express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, './web/build')))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})