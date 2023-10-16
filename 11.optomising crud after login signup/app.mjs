import express from "express";
import cors from "cors";
import path from "path";
const __dirname = path.resolve();
import "dotenv/config";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import authRouter from "./routes/auth.mjs";
import postRouter from "./routes/post.mjs";
import feedRouter from "./routes/feed.mjs";
import commentRouter from "./routes/comment.mjs";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: ['http://localhost:3000', "*"],
    credentials: true
  }
  ));
  
  


app.use(authRouter)



app.use("/api/v1", (req, res, next) => {
  console.log("cookies: ", req.cookies);

  const token = req.cookies.token;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("decoded: ", decoded);
    req.body.decoded = {
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      _id: decoded._id,
    };
    next();
  } catch (err) {
    res.status(401).send({ message: "invalid tokken" });
  }
});


app.use(postRouter)
app.use("/ping", (req, res)=> {
  res.send("ok")
})





app.use('/', express.static(path.join(__dirname, 'web/build')))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/web/build/index.html'))
    // res.redirect('/');
})

const PORT = process.env.PORT || 5002
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})