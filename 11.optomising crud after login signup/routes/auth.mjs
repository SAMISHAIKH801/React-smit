
import express from 'express'
import { client } from '../mongodb.mjs'
import { stringToHash, varifyHash, validateHash } from "bcrypt-inzi"
import jwt  from 'jsonwebtoken';

const userCollection = client.db("cruddb").collection("users");


let router = express.Router()

router.post('/signup', async (req, res, next) => {
    
    if(    !req.body?.firstName 
        || !req.body?.lastName
        || !req.body?.email
        || !req.body?.password  // T000: convert password into hush
        ){

        res.status(401).send(`required parameters is missing, 
        example request body  {
    firstName: "some firstName"
    lastName: "some lastName"
    email: "some@gmail.com"
    password: "some$password"
        }`)
        return;
    }        
    
    req.body.email =  req.body.email.toLowerCase()
    try
       {let result = await userCollection.findOne({email: req.body.email});
    console.log('result', result)

    if(!result){ // user not found

        const passwordHash = await stringToHash(req.body.password)

        let newPost = {
            isAdmin: false,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
        }
        // Insert a single document, wait for promise so we can read it back
        const insertResponse = await userCollection.insertOne(newPost);
        console.log("insertResponse", insertResponse)
         
         res.send({message: "SignUp successful"})
    

    }else {
        res.status(403).send({message: "user already exist with this email"})
    }
    // res.send(result)
    } catch (e){
       console.log('error inserting mongodb', e);
       res.status(500).send('server error, please try later')
    }
} )

  

      ////////// login api //////////////

router.post('/login', async (req, res, next) => {
      
    if(    !req.body?.email
        || !req.body?.password  // T000: convert password into hush
        ){

        res.status(401).send(`required parameters is missing, 
        example request body  {
    email: "some@gmail.com"
    password: "some$password"
        }`)
        return;
    }        

    req.body.email =  req.body.email.toLowerCase()
    try{
        let result = await userCollection.findOne({email: req.body.email});
    console.log('result', result)

    if(!result){ // user not found

        res.status(401).send({ message: "email or password incorrect" });

    return;
    }else {

        const isMatch = await varifyHash(req.body.password, result.password)
        if(isMatch){
            // const dateAfter24HInMili = (new Date().getTime() + (24 * 60 * 60 * 1000));

            //TODO: token for this user
            const token = jwt.sign({
                 email: req.body.email,
                isAdmin: result.isAdmin,
                firstName: result.firstName,
                lastName: result.lastName,
                _id: result._id
                // createdOn: newDate().getTime,
                // expires: dateAfter24HInMili,
         }, process.env.SECRET, {
            expiresIn: '24h'
         });

            res.cookie('token', token,
             { httpOnly: true,
                secure: true, 
                expires: new Date(Date.now() + 86400000)
            })
            res.send({ message: "login successful",
        data: {
            isAdmin: result.isAdmin,
            email: req.body.email,
            firstName: result.firstName,
            lastName: result.lastName
            // createdOn: newDate().getTime,
            // expires: dateAfter24HInMili,
     }
     });
            return;
        }else{
            res.status(401).send({ message: "email or password incorrect" });

            return;
        }
    }
    // res.send(result)
    } catch (e){
       console.log('error inserting mongodb', e);
       res.status(500).send('server error, please try later')
    }

   
    
})

router.post('/logout', async (req, res, next) => {

    // res.cookie('token', '', {
    //     httpOnly: true,
    //     secure: true,
    //     expires: new Date(Date.now() + 86400000)
    // });

    res.clearCookie('token');
    res.send({ message: 'logout successful' });
})

export default router
