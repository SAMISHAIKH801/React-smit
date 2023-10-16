
import express, { text } from 'express'
// import { nanoid } from 'nanoid'

import { customAlphabet } from 'nanoid'

import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb'
// import pinecone from '.././pinecone.mjs';

import pinecone, { openai as openaiClient } from '../pinecone.mjs';
// import { UpsertRequestFromJSON } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

const nanoid = customAlphabet('1234567890abcdef', 10)
const db = client.db("cruddb")
const col = db.collection("posts");
const pcIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
console.log("process.env.PINECONE_INDEX_NAME: ", process.env.PINECONE_INDEX_NAME)


let router = express.Router()
//search routes

router.get('/search', async (req, res, next) => {
 
  
    try {
    const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: req.query.q,
    });
    const vector = response?.data[0]?.embedding
    console.log("vector: ", vector);
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

    // const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const queryResponse = await pcIndex.query({
   
            vector: vector,
            // id: "vec1",
            topK: 20,
            includeValues: false,
            includeMetadata: true,
            // namespace: process.env.PINECONE_NAME_SPACE
        
    })

    queryResponse.matches.map(eachMatch => {
        console.log(`score ${eachMatch.score.toFixed(3)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
    })
    console.log(`${queryResponse.matches.length} records found `);
    const formattedOutput = queryResponse.matches.map(eachMatch => ({
     text: eachMatch?.metadata?.text,
     title: eachMatch?.metadata?.title,
     _id: eachMatch?.id,
    }))
    

    res.send(formattedOutput)
    } catch (e){
            console.log('error getting data pinecone', e);
            res.status(500).send('server error, please try later')
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
         
     }                                                               
     //     let newPost = {
         //     id:  nanoid(),
         //      title: req.body.title,
         //      text: req.body.text
         // }
         // // Insert a single document, wait for promise so we can read it back
         // const insertResponse = await col.insertOne(newPost);
         // console.log("insertResponse", insertResponse)
    try {
     
    const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: `${req.body.title} ${req.body.text}`,
    })
    const vector = response?.data[0]?.embedding;
    // console.log("vector: ", vector)
    console.log("vector dimensions: ", vector.length);



const upsertResponse = await pcIndex.upsert( [{
    id: nanoid (),
    values: vector,
    metadata: {
        title: req.body.title,
        text: req.body.text
                    },
 }],);
console.log("upsertResponse: ", upsertResponse)


     res.send({message: 'Post created'})
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send({message: 'server error, please try later'})
    }
     
 })
    //  All posts get >>>>>>
 router.get('/posts', async (req, res, next) => {
 
    //  const cursor = col.find({});

    //  try {let results = await cursor.toArray()
    //  console.log('results', results)
    //  res.send(results)
    // } catch (e){
    //     console.log('error inserting mongodb', e);
    //     res.status(500).send('server error, please try later')
    // }
    try {
    const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: "",
    });
    const vector = response?.data[0]?.embedding
    console.log("vector: ", vector);
    // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]

    // const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const queryResponse = await pcIndex.query({
   
            vector: vector,
            // id: "vec1",
            topK: 10000,
            includeValues: true,
            includeMetadata: true,
            // namespace: process.env.PINECONE_NAME_SPACE
        
    });

    queryResponse.matches.map(eachMatch => {
        console.log(`score ${eachMatch.score.toFixed(1)} => ${JSON.stringify(eachMatch.metadata)}\n\n`);
    })
    console.log(`${queryResponse.matches.length} records found `);
    const formattedOutput = queryResponse.matches.map(eachMatch => ({
     text: eachMatch?.metadata?.text,
     title: eachMatch?.metadata?.title,
     _id: eachMatch?.id,
    }))
    

    res.send(formattedOutput)
    } catch (e){
            console.log('error getting data pinecone', e);
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

    // if(!ObjectId.isValid(req.params.postId)){
    //     res.status(403).send(`Invalid post id  `)
    //     return;
    // }


    if( !req.body.title
        && !req.body.text){
        res.status(403).send(`Required parameter is missing, atleast one key is required, Example put body, 
        put /api/post/:postId
        {  title: req.body.title,
            text:  req.body.text }`)
    }

//     let dataToBeUpdated = {};
// if (req.body.title) { dataToBeUpdated.title = req.body.title; }
// if (req.body.text) { dataToBeUpdated.text = req.body.text; }
//     try {
//     const updateResponse = await col.updateOne({
//         _id: new ObjectId(req.params.postId)
//     },{
//                 $set: dataToBeUpdated
//     });
//     console.log("updateResponse", updateResponse)
     
//      res.send('Post updated')
//     } catch (e){
//         console.log('error inserting mongodb', e);
//         res.status(500).send('server error, please try later')
//     }

try {
     
    const response = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: `${req.body.title} ${req.body.text}`,
    })
    const vector = response?.data[0]?.embedding;
    // console.log("vector: ", vector)
    console.log("vector dimensions: ", vector.length);



const upsertResponse = await pcIndex.upsert( [{
    id: req.params.postId,
    values: vector,
    metadata: {
        title: req.body.title,
        text: req.body.text
                    },
 }],);
console.log("upsertResponse: ", upsertResponse)


     res.send({message: 'Post edit'})
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send({message: 'server error, please try later'})
    }
   
})
router.delete('/post/:postId', async (req, res, next) => {

    console.log('this is login', new Date())
    // if(!ObjectId.isValid(req.params.postId)){
    //     res.status(403).send(`Invalid post id  `)
    //     return;
    // }


    // try {
    //     const deleteResponse = await col.deleteOne({
    //         _id: new ObjectId(req.params.postId)
    //     }

    //     );
    //     console.log("deleteResponse", deleteResponse)
         
    //      res.send('Post deleted')
    //     } catch (e){
    //         console.log('error deleting mongodb', e);
    //         res.status(500).send('server error, please try later')
    //     }

    // const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const deleteResponse = await pcIndex.deleteOne(req.params.postId)
    console.log("deleteResponse: ", deleteResponse);
      res.send('post deleted')
}

    

)

export default router





