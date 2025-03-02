"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import useSocketStore from '@/store/socketStore';

export default function LoginForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);
  const initSocket = useSocketStore(state => state.initSocket);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(id, password);
      setToken(token);
      setUser({ id, token });

      // Initialize socket connection
      initSocket(token);

      router.push('/chat-list');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };


  return (
    <Card className="w-[350px]">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Login</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </CardContent>
    </Card>
  );
}
