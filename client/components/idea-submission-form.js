"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMyIdeaStore } from "@/lib/store/myIdeaStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function IdeaSubmissionForm() {
  const router = useRouter();
  const addIdea = useMyIdeaStore((state) => state.addIdea);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Create new idea with unique ID and timestamp
    const newIdea = {
      id: Date.now().toString(),
      ...formData,
      votes: 0,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Add to store
    addIdea(newIdea);

    // Show success message
    toast({
      title: "Success!",
      description: "Your idea has been submitted",
    });

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
    });

    setIsSubmitting(false);

    // Navigate to browse tab
    setTimeout(() => {
      document.querySelector('[data-value="browse"]').click();
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Idea</CardTitle>
        <CardDescription>
          Share your suggestions to help us improve our services
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Enter a clear, concise title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your idea in detail"
              rows={5}
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Idea"}
          </Button>
        </CardFooter>
      </form>
      <Toaster />
    </Card>
  );
}
