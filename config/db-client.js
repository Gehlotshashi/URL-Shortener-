import {MongoClient } from "mongodb";

 export const client = new MongoClient("mongodb://127.0.0.1");
await client.connect();
const db = client.db('mongodb_nodejs');

const userCollection  = db.collection("users");