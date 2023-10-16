
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://dbuser801:dbpassword@cluster0.hswflja.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");
    } catch (err) {
        console.log(err.stack);
        await client.close();
        process.exit(1);
    }
   
}
run().catch(console.dir);

process.on("SIGINT", async function() {
  console.log("app is terminating")
  await client.close();
  process.exit(1);
})

// const db = client.db("cruddb"); // Yahaan pe database ko access ke liye 'client.db' ka use karna he
// export {  client, db };

// import { MongoClient } from 'mongodb';

// const uri = "mongodb+srv://dbuser801:dbpassword@cluster0.hswflja.mongodb.net/?retryWrites=true&w=majority";
// export const client = new MongoClient(uri);

// async function run() {
//     try {
//         await client.connect();
//         console.log("Successfully connected to Atlas");
//     } catch (err) {
//         console.log(err.stack);
//         await client.close();
//         process.exit(1);
//     }
// }

// run().catch(console.dir);

// process.on("SIGINT", async function() {
//   console.log("app is terminating")
//   await client.close();
//   process.exit(1);
// })

// const db = client.db("cruddb"); // Yahaan pe database ko access ke liye 'client.db' ka use karein
// export { db };