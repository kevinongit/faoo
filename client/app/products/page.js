"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PiggyBank, CreditCard, Briefcase, TrendingUp } from "lucide-react";

const productCategories = [
  { id: "all", label: "전체" },
  { id: "savings", label: "예금" },
  { id: "loans", label: "대출" },
  { id: "investments", label: "투자" },
  { id: "cards", label: "카드" },
];

const products = [
  {
    id: 1,
    title: "자유적금",
    description: "매월 자유롭게 저축하는 적금 상품",
    category: "savings",
    icon: <PiggyBank className="w-8 h-8 text-blue-500" />,
    badge: "인기",
    interestRate: "연 3.5%",
  },
  {
    id: 2,
    title: "직장인 신용대출",
    description: "직장인을 위한 저금리 신용대출",
    category: "loans",
    icon: <Briefcase className="w-8 h-8 text-green-500" />,
    interestRate: "연 5.5%",
  },
  {
    id: 3,
    title: "주식형 펀드",
    description: "국내 우량 주식에 투자하는 펀드",
    category: "investments",
    icon: <TrendingUp className="w-8 h-8 text-red-500" />,
    badge: "고위험",
  },
  {
    id: 4,
    title: "캐시백 신용카드",
    description: "모든 가맹점에서 1.5% 캐시백",
    category: "cards",
    icon: <CreditCard className="w-8 h-8 text-purple-500" />,
    badge: "새상품",
  },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">금융 상품</h1>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          {productCategories.map((category) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">
                {product.title}
              </CardTitle>
              {product.badge && (
                <Badge variant="secondary">{product.badge}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {product.icon}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  {product.interestRate && (
                    <p className="text-sm font-semibold mt-1">
                      금리: {product.interestRate}
                    </p>
                  )}
                  <Button variant="link" className="mt-2 p-0">
                    상품 상세보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
