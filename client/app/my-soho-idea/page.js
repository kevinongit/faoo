import IdeaSubmissionForm from "@/components/idea-submission-form";
import IdeaList from "@/components/idea-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MySohoIdea() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-md md:max-w-2xl">
      <h1 className="text-2xl font-bold text-center mb-6">
        소상공인 아이디어 광장
      </h1>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="browse">아이디어 리스트</TabsTrigger>
          <TabsTrigger value="submit">아이디어 제출</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <IdeaList />
        </TabsContent>

        <TabsContent value="submit">
          <IdeaSubmissionForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
