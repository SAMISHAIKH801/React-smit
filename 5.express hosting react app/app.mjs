import express from 'express'
import cors from 'cors';
import path  from 'path';
const __dirname = path.resolve();
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import jwt  from 'jsonwebtoken';

import authRouter from "./routes/auth.mjs"
import postRouter from "./routes/post.mjs"
import feedRouter from "./routes/feed.mjs"
import commentRouter from "./routes/comment.mjs"



const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(authRouter)

app.use(express.static(path.join(__dirname, './web/build')))

app.use((req, res, next) =>{
  console.log("cookies: ", req.cookies)

  const token = req.cookies.token;
  try{
    const decoded = jwt.verify(token, process.env.SECRET)
    console.log("decoded: ", decoded);
    req.body.decoded = {
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };
    next()
  }catch(err){

    res.status(401).send({message: "invalid tokken"})
  }
})

app.use(postRouter)
app.use(feedRouter)
app.use(commentRouter)





// example.com
app.use("static", express.static(path.join(__dirname, 'static')))

const PORT = process.env.PORT || 3031
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})