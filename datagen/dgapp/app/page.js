import PageLayout from './PageLayout'
import GeneratePage from "./GeneratePage";

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
    <PageLayout>
      <GeneratePage users={users} trends={trends} />
    </PageLayout>
  );
}