"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, CreditCard, Percent, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const benefitCategories = [
  { id: "all", label: "전체" },
  { id: "card", label: "카드" },
  { id: "savings", label: "예금" },
  { id: "loan", label: "대출" },
];

const benefits = [
  {
    id: 1,
    title: "신규 가입 보너스",
    description: "첫 계좌 개설 시 10만원 즉시 지급",
    category: "savings",
    icon: <Gift className="w-8 h-8 text-purple-500" />,
    badge: "신규",
  },
  {
    id: 2,
    title: "카드 캐시백",
    description: "모든 가맹점에서 2% 캐시백",
    category: "card",
    icon: <CreditCard className="w-8 h-8 text-blue-500" />,
    badge: "인기",
  },
  {
    id: 3,
    title: "금리 우대",
    description: "예금 금리 0.5% 추가",
    category: "savings",
    icon: <Percent className="w-8 h-8 text-green-500" />,
  },
  {
    id: 4,
    title: "대출 금리 할인",
    description: "신용점수에 따라 최대 1% 금리 할인",
    category: "loan",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
  },
];

export default function BenefitsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredBenefits =
    activeCategory === "all"
      ? benefits
      : benefits.filter((benefit) => benefit.category === activeCategory);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">혜택</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            {benefitCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBenefits.map((benefit) => (
            <Card key={benefit.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {benefit.title}
                </CardTitle>
                {benefit.badge && (
                  <Badge variant="secondary">{benefit.badge}</Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  {benefit.icon}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                    <Button variant="link" className="mt-2 p-0">
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
