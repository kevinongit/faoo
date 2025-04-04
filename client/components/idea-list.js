"use client";

import { useState } from "react";
import { useMyIdeaStore } from "@/lib/store/myIdeaStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThumbsUp, MessageSquare, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function IdeaList() {
  const ideas = useMyIdeaStore((state) => state.ideas);
  const upvoteIdea = useMyIdeaStore((state) => state.upvoteIdea);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter((idea) => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter
        ? idea.category === categoryFilter
        : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "popular") {
        return b.votes - a.votes;
      }
      return 0;
    });

  const handleUpvote = (id) => {
    upvoteIdea(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "불편사항":
        return "bg-blue-500";
      case "새로운 아이디어":
        return "bg-green-500";
      case "요청사항":
        return "bg-purple-500";
      case "기타":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input
          placeholder="아이디어 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>아이디어 검색</SheetTitle>
              <SheetDescription>
                아이디어를 검색하고 필터링하세요
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">카테고리</label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체 카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="불편사항">불편사항</SelectItem>
                    <SelectItem value="새로운 아이디어">
                      새로운 아이디어
                    </SelectItem>
                    <SelectItem value="요청사항">요청사항</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">정렬</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">최신순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            검색된 아이디어가 없습니다. 첫 번째 아이디어를 제안해보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{formatDate(idea.createdAt)}</span>
                      <Badge
                        variant="secondary"
                        className={getCategoryColor(idea.category)}
                      >
                        {idea.category}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleUpvote(idea.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{idea.votes}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{idea.description}</p>
              </CardContent>
              <CardFooter className="pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>댓글</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
