// app/profile/page.js
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data;
    },
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user?.username}</h1>
              <p className="text-gray-500">@{user?.userId}</p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>나이</Label>
              <p className="text-lg">{user?.age || "미입력"}</p>
            </div>
            <div>
              <Label>직업</Label>
              <p className="text-lg">{user?.job || "미입력"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
