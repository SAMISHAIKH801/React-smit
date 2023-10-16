
import express, { text } from 'express'
import { nanoid } from 'nanoid'
import { client } from '../mongodb.mjs'
import { ObjectId } from 'mongodb'

const db = client.db("cruddb")
const col = db.collection("posts");


let router = express.Router()


// single post >>>>>
// Not recommended 
// let posts = [
//     {
//      id: nanoid(),
//      title: "abc",
//      text: "Hello world",
//     }
//  ]
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
        // id:  nanoid(),
        from: req.body.decoded.email,
         title: req.body.title,
         text: req.body.text
    }
    // Insert a single document, wait for promise so we can read it back
    const insertResponse = await col.insertOne(newPost);
    console.log("insertResponse", insertResponse)
     
     res.send('Post created')
    } catch (e){
        console.log('error inserting mongodb', e);
        res.status(500).send('server error, please try later')
    }
     
 })
    //  All posts get >>>>>>
 router.get('/posts', async (req, res, next) => {
 
     const cursor = col.find({}).sort({_id: -1});

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
            return
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

    // console.log('this is login', new Date())
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





