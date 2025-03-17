// pages/api/mongo.js
import { NextApiRequest, NextApiResponse } from "next";
import { fetchCollections } from "./mongo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const data = await fetchCollections();
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(500).json({ message: "Failed to fetch data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
