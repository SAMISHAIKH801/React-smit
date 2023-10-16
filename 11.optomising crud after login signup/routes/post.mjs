
import express, { text } from 'express'
import { nanoid } from 'nanoid'
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb'
import OpenAI from "openai";


const db = client.db("cruddb")
const col = db.collection("posts");

const userCollection = db.collection("users");


let router = express.Router()

const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const getProfileMiddleware = async (req, res, next) => {
    console.log('this is get', new Date())

   
    const userId = req.params.userId || req.body.decoded._id;

    if (!ObjectId.isValid(userId)) {
        res.status(403).send(`Invalid user id`);
        return;
    }

    try {
        let result = await userCollection.findOne({ _id: new ObjectId(userId) });
    console.log('result', result)
    res.send({
        massege: "profile fatched",
        data:{
            isAdmin: result?.isAdmin,
            firstName: result?.firstName,
            lastName: result?.lastName,
            email: result?.email,
        }
    })
} catch (e){
    console.log('error inserting mongodb', e);
    res.status(500).send('server error, please try later')
} 
}

router.get('/profile', getProfileMiddleware)
router.get('/profile/:userId', getProfileMiddleware)


router.get('/search', async (req, res, next) => {
console.log(req.query.q)
    try {
        const response = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: req.query.q,
        });
        const vector = response?.data[0]?.embedding
        console.log("vector: ", vector);
        // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

        // Query for similar documents.
        const documents = await col.aggregate([
            {
                "$search": {
                    "index": "vectorIndex",
                    "knnBeta": {
                        "vector": vector,
                        "path": "embedding",
                        "k": 10 // number of documents
                    },
                    "scoreDetails": true

                }
            },
            {
                "$project": {
                    "embedding": 0,
                    "score": { "$meta": "searchScore" },
                    "scoreDetails": { "$meta": "searchScoreDetails" }
                }
            }
        ]).toArray();

        documents.map(eachMatch => {
            console.log(`score ${eachMatch?.score?.toFixed(3)} => ${JSON.stringify(eachMatch)}\n\n`);
        })
        console.log(`${documents.length} records found `);

        res.send(documents);

    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }

})


// single post >>>>>
// Not recommended 
let posts = [
    {
     id: nanoid(),
     title: "abc",
     text: "Hello world",
    }
 ]
 router.post('/post', async (req, res, next) => {
     console.log('this is login', new Date())
 
     if(    !req.body.title 
         || !req.body.text){
 
         res.status(401).send(`required parameters is missing, 
         example request body  {
     title: "abc post title",
     text: "same post text",
         }`)
         return;
         
     }                                                               
    try {let newPost = {
        id:  nanoid(),
         title: req.body.title,
         text: req.body.text,
         authorEmail: req.body.decoded.email,
         authorId: req.body.decoded._id
    }
    // Insert a single document, wait for promise so we can read it back
    const insertResponse = await col.insertOne(newPost);
    console.log("insertResponse", insertResponse)
     
     res.send({message: 'Post created'})
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send({message: 'server error, please try later'})
    }
     
 })

 router.get('/feed', async (req, res, next) => {

   
    const cursor = col.find({})
        .sort({ _id: -1 })
        .limit(100);

    try {
        let results = await cursor.toArray()
        console.log("results: ", results);
        res.send(results);
    } catch (e) {
        console.log("error getting data mongodb: ", e);
        res.status(500).send('server error, please try later');
    }

 }  )


    //  All posts get >>>>>>
 router.get('/posts', async (req, res, next) => {

    const userId = req.query._id || req.body.decoded._id

    if(!ObjectId.isValid(userId)){
        res.status(403).send(`Invalid post id  `)
        return;
    }
 
     const cursor = col.find({_id: userId})
      .sort({ _id: -1})
      .limit(100)

     try {let results = await cursor.toArray()
     console.log('results', results)
     res.send(results)
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send('server error, please try later')
    }
})

// single id post  
router.get('/post/:postId', async (req, res, next) => {
    console.log('this is get', new Date())

    if(!ObjectId.isValid(req.params.postId)){
        res.status(403).send(`Invalid post id  `)
        return;
    }

    // const cursor = col.find({_id: new ObjectId(req.params.postId)});
    
    try {let result = await col.findOne({_id: new ObjectId(req.params.postId)});
    console.log('result', result)
    res.send(result)
    } catch (e){
       console.log('error inserting mongodb', e);
       res.status(500).send('server error, please try later')
    }

    // for(let i=0; i < posts.length; i++){
    //     if(posts[i].id === req.params.postId){
    //         res.send(posts[i])
    //         return;
    //     }
    // }
    // res.send('post not found with id' + req.params.postId)
    
})
//  PUT edit >>>>>.
router.put('/post/:postId', async (req, res, next) => {

    if(!ObjectId.isValid(req.params.postId)){
        res.status(403).send(`Invalid post id  `)
        return;
    }


    if( !req.body.title
        && !req.body.text){
        res.status(403).send(`Required parameter is missing, atleast one key is required, Example put body, 
        put /api/post/:postId
        {  title: req.body.title,
            text:  req.body.text }`)
    }

    let dataToBeUpdated = {};
if (req.body.title) { dataToBeUpdated.title = req.body.title; }
if (req.body.text) { dataToBeUpdated.text = req.body.text; }
    try {
    const updateResponse = await col.updateOne({
        _id: new ObjectId(req.params.postId)
    },{
                $set: dataToBeUpdated
    });
    console.log("updateResponse", updateResponse)
     
     res.send('Post updated')
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send('server error, please try later')
    }

   
})
router.delete('/post/:postId', async (req, res, next) => {

    console.log('this is login', new Date())
    if(!ObjectId.isValid(req.params.postId)){
        res.status(403).send(`Invalid post id  `)
        return;
    }


    try {
        const deleteResponse = await col.deleteOne({
            _id: new ObjectId(req.params.postId)
        }

        );
        console.log("deleteResponse", deleteResponse)
         
         res.send('Post deleted')
        } catch (e){
            console.log('error deleting mongodb', e);
            res.status(500).send('server error, please try later')
        }

    // for(let i=0; i < posts.length; i++){
    //     if(posts[i].id === req.params.postId){

    //       posts.splice(i, 1)
    //       res.send('post deleted with id' + req.params.postId)
    //         return;
    //     }
    // }
    // res.status(404).send('Post not found with id ' + req.params.pId);

}
)

export default router





