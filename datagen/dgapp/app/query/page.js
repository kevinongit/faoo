import { connectToDatabase } from "../lib/mongodb";
import QueryPage from "../QueryPage";
import Navbar from "../components/Navbar";

async function fetchCollectionsAndData() {
  const { db } = await connectToDatabase();
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((col) => col.name);
  const initialMongoData =
    collectionNames.length > 0
      ? await fetchDataFromMongo(collectionNames[0])
      : null;
  return { collections: collectionNames, initialMongoData };
}

async function fetchDataFromMongo(collectionName) {
  const { db } = await connectToDatabase();
  const collection = db.collection(collectionName);
  console.log("Fetching data from MongoDB collection:", collectionName);
  const rawData = await collection
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();
  const data = rawData.map((d) => {
    delete d._id;
    return d;
  });
  console.log("MongoDB fetch result:", data);
  return data[0] || {};
}

export default async function Page() {
  const { collections, initialMongoData } = await fetchCollectionsAndData();
  return (
    <div className="min-h-screen">
      <Navbar />
      <QueryPage
        collections={collections}
        initialMongoData={initialMongoData}
      />
    </div>
  );
}
