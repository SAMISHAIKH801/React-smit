
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
    try
       {let result = await userCollection.findOne({email: req.body.email});
    console.log('result', result)

    if(!result){ // user not found

        res.status(401).send({ message: "email or password incorrect" });

    return;
    }else {

        const isMatch = await varifyHash(req.body.password, result.password)
        if(isMatch){
            // const dateAfter24HInMili = (new Date().getTime() + (24 * 60 * 60 * 1000));

            //TODO: token for this user
            const token = jwt.sign({ email: req.body.email,
            // createdOn: newDate().getTime,
            // expires: dateAfter24HInMili,
            isAdmin: false 
         }, process.env.SECRET, {
            expiresIn: '1h'
         });

            res.cookie('token', token,
             { httpOnly: true,
                secure: true, 
                // expires: new Date (dateAfter24HInMili)
            })
            res.send({ message: "login successful" });
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


export default router

// import express from 'express';
// import { client } from '../mongodb.mjs';
// import { stringToHash, varifyHash } from "bcrypt-inzi";
// import jwt from 'jsonwebtoken';

// const userCollection = client.db("cruddb").collection("users");

// let router = express.Router();

// router.post('/signup', async (req, res, next) => {
//     // ... signup code ...
// });

// router.post('/login', async (req, res, next) => {
//     if (!req.body?.email || !req.body?.password) {
//         res.status(401).send(`required parameters are missing,
//         example request body {
//     email: "some@gmail.com",
//     password: "some$password"
//         }`);
//         return;
//     }

//     req.body.email = req.body.email.toLowerCase();
//     console.log('Email:', req.body.email); // Log email value

//     try {
//         let result = await userCollection.findOne({ email: req.body.email });
//         console.log('result', result);

//         if (!result) {
//             res.status(401).send({ message: "email or password incorrect" });
//         } else {
//             console.log('Password from request:', req.body.password); // Log password value

//             const isMatch = await varifyHash(req.body.password, result.password);
//             console.log('isMatch:', isMatch); // Log isMatch value

//             if (isMatch) {
//                 const token = jwt.sign({ userId: result._id }, 'shhhhh');
//                 res.cookie('token', token, { httpOnly: true });
//                 res.send({ message: "login successful" });
//             } else {
//                 res.status(401).send({ message: "email or password incorrect" });
//             }
//         }
//     } catch (e) {
//         console.log('error fetching from mongodb', e);
//         res.status(500).send('server error, please try later');
//     }
// });

// export default router;
