import {connectToDatabase} from "./lib/mongodb";
import GeneratePage from "./GeneratePage";
import Navbar from "./components/Navbar";
import SystemFlow from "../components/ui/SystemFlow";
async function fetchUsersAndTrends() {
  try {
    const [usersRes, trendsRes] = await Promise.all([
      fetch("http://localhost:3400/users"),
      fetch("http://localhost:3400/rtrend")
    ]);
    const users = await usersRes.json();
    const trends = await trendsRes.json();
    // console.log("Fetched users and trends:", { users, trends });
    return {users, trends};
  } catch (error) {
    console.error("Error fetching users or trends:", error);
    return {users: [], trends: []};
  }
}

export default async function Page() {
  const {users, trends} = await fetchUsersAndTrends();
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-row gap-4 p-4">
        <div className="w-2/5 h-[calc(100vh-64px)]">
          <SystemFlow />
        </div>
        <div className="w-3/5">
          <GeneratePage
            users={users}
            trends={trends}
          />
        </div>
      </div>
      <SystemFlow />
    </div>
  );
}
