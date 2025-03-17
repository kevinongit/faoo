import { connectToDatabase } from "../lib/mongodb";
import NotifyPage from "../NotifyPage";
import Navbar from "../components/Navbar";

async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:3400/users");
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function Page() {
  const users = await fetchUsers();
  return (
    <div className="min-h-screen">
      <Navbar />
      <NotifyPage users={users} />
    </div>
  );
}
