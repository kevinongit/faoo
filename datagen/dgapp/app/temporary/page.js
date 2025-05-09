import PageLayout from "../PageLayout";
import TemporaryPage from "../TemporaryPage";
import { DGSV2_URL } from "../constants/api";

async function fetchUsersAndTrends() {
  try {
    const usersRes = await fetch(`${DGSV2_URL}/users`);
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
    <PageLayout>
      <TemporaryPage users={users} />
    </PageLayout>
  );
}
