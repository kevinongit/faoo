import TemporaryPage from "../TemporaryPage";
import Navbar from "../components/Navbar";

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
      <TemporaryPage users={users} />
    </div>
  );
}
