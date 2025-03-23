import TemporaryPage from "../TemporaryPage";
import Navbar from "../components/Navbar";
import SystemFlow from "../../components/ui/SystemFlow";

async function fetchUsersAndTrends() {
  try {
    const usersRes = await fetch("http://localhost:3400/users");
    const users = await usersRes.json();
    // console.log("Fetched users and trends:", { users, trends });
    return users;
  } catch (error) {
    console.error("Error fetching users or trends:", error);
    return [];
  }
}

export default async function Page() {
  const users = await fetchUsersAndTrends();
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-row gap-4 p-4">
        <div className="w-2/5 h-[calc(100vh-64px)]">
          <SystemFlow />
        </div>
        <div className="w-3/5">
          <TemporaryPage users={users} />
        </div>
      </div>
    </div>
  );
}
