"use server";

import { connectToDatabase } from "../lib/mongodb";

export async function saveDataToMongo(data) {
  try {
    const { client } = await connectToDatabase();
    const db = client.db("originalData");
    const collection = db.collection("sales_data");
    await collection.insertOne({ ...data, createdAt: new Date() });
    return { success: true };
  } catch (error) {
    console.error("Error in saveDataToMongo:", error);
    throw new Error("Failed to save data to MongoDB");
  }
}

export async function fetchMongoData(collectionName) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(collectionName || "sales_data");
    const data = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    console.log("MongoDB fetch result:", data);
    return data[0] || {};
  } catch (error) {
    console.error("Error in fetchMongoData:", error);
    throw new Error("Failed to fetch data from MongoDB");
  }
}
