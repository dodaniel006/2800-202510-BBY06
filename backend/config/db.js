import { MongoClient } from 'mongodb';
import { dbUri } from './config.js'; 
const client = new MongoClient(dbUri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('Japples');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

export default connectToMongo;
