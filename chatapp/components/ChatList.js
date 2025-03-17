"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Settings } from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import Image from "next/image";
import useSocketStore from "@/store/socketStore";
import { fetchUsers, markAllRead, sendFileNotification } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ChatList() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    chatList,
    fetchChatList,
    selectChat,
    isLoading,
    error,
    addMessage,
    updateUnreadCount,
    addChat, // 추가된 액션
  } = useChatStore();
  const socket = useSocketStore((state) => state.socket);
  const [users, setUsers] = useState([]);
  const [showFileNotifyForm, setShowFileNotifyForm] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");

  useEffect(() => {
    if (socket && user) {
      socket.emit("join", user.id);
      fetchChatList(user.id);
    }
  }, [socket, user, fetchChatList]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        const senderId = message.from;

        // chatList에 senderId가 존재하는지 확인
        const chatExists = chatList.some((chat) => chat.with === senderId);

        if (!chatExists && senderId !== user.id) {
          // 새로운 대화 항목 추가
          const newChat = {
            with: senderId,
            unreadCount: 1,
            messages: [message],
          };
          addChat(newChat);
        } else {
          // 기존 대화에 메시지 추가
          addMessage(senderId, message);
          if (senderId !== user.id) {
            updateUnreadCount(senderId, (prev) => prev + 1);
          }
        }
      };

      socket.on("new-message", handleNewMessage);
      return () => {
        socket.off("new-message", handleNewMessage);
      };
    }
  }, [socket, chatList, addMessage, updateUnreadCount, addChat, user.id]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        const filteredUsers = fetchedUsers.filter((u) => u.id !== user.id);
        setUsers(filteredUsers);
      } catch (err) {
        console.log(err.message);
      }
    };

    getUsers();
  }, [user.id]);

  const formatDate = (timestamp) => {
    const date = parseISO(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, "a h:mm");
    } else if (date.getDate() === now.getDate() - 1) {
      return "어제";
    } else {
      return format(date, "M월 d일");
    }
  };

  const selectChatHandler = async (chatId) => {
    try {
      await markAllRead({ userId: user.id, chatId });
      updateUnreadCount(chatId, 0);
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
    selectChat(chatId);
    router.push(`/chat/${chatId}`);
  };

  const handleFileNotify = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    if (!data.filename.includes(".")) {
      data.filename += `.${data.type.toLowerCase()}`;
    }

    data.fromDate =
      formData.get("fromDate") || new Date().toISOString().split("T")[0];
    data.toDate =
      formData.get("toDate") ||
      addDays(new Date(), 10).toISOString().split("T")[0];

    try {
      await sendFileNotification(data);
      setShowFileNotifyForm(false);
    } catch (error) {
      console.error("Error sending file notification:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center p-4 bg-white">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">채팅</h1>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xl">@{user.id}</span>
        </div>
        <div className="flex-1 text-right">
          <Search className="inline-block mr-4" />
          {user.id === "admin" && (
            <Dialog
              open={showFileNotifyForm}
              onOpenChange={setShowFileNotifyForm}
            >
              <DialogTrigger asChild>
                <Settings className="inline-block cursor-pointer" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>파일 알림 전송</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFileNotify} className="space-y-4">
                  <Select
                    name="to"
                    required
                    value={selectedRecipient}
                    onValueChange={setSelectedRecipient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="수신자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    name="title"
                    placeholder="제목"
                    defaultValue="2분기 매출보고서"
                    required
                  />
                  <Textarea
                    name="desc"
                    placeholder="설명"
                    defaultValue="사장님 2분기 매출 보고서입니다."
                    required
                  />
                  <Input
                    name="path"
                    placeholder="다운로드 디렉토리"
                    defaultValue="/pdf"
                    required
                  />
                  <Select
                    name="type"
                    required
                    value={selectedFileType}
                    onValueChange={setSelectedFileType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="파일 타입" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">엑셀</SelectItem>
                      <SelectItem value="docx">워드</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    name="filename"
                    placeholder="파일명"
                    defaultValue="2q-revenue"
                    required
                  />
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      name="fromDate"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <Input
                      type="date"
                      name="toDate"
                      defaultValue={
                        addDays(new Date(), 10).toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!selectedRecipient || !selectedFileType}
                  >
                    전송
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="w-full max-w-[500px] mb-5 mx-auto">
        <Image
          src="/images/banners/sky2-500x150.jpg"
          alt="Banner"
          width={500}
          height={140}
          className="object-cover w-full h-auto"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAbEAACAgMBAAAAAAAAAAAAAAAcEAYQMEISI//EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGREAAgMBAAAAAAAAAAAAAAAAABEBEiEx/9oADAMBAAIRAxEAPwCNtA1u3zIJG5k6sM9oHWOeR2A2H3qPEeM5YcE8dQv/Z"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {chatList.map((chat) => (
          <Card
            key={chat.with}
            className="mb-2"
            onClick={() => selectChatHandler(chat.with)}
          >
            <div className="flex items-center h-20 p-4">
              <Avatar className="flex-shrink-0 w-16 h-16 mr-4 rounded-lg">
                <AvatarImage asChild src={`/images/users/${chat.with}.jpg`}>
                  <Image alt="Avatar" width={40} height={40} />
                </AvatarImage>
                <AvatarFallback>{chat.with}</AvatarFallback>
              </Avatar>
              <div className="flex-grow mr-4 overflow-hidden">
                <h3 className="text-lg font-semibold">{chat.with}</h3>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {chat.messages[chat.messages.length - 1].type === "text"
                    ? chat.messages[chat.messages.length - 1].content
                    : chat.messages[chat.messages.length - 1].title}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 text-right">
                <p className="text-xs text-gray-500">
                  {formatDate(
                    chat.messages[chat.messages.length - 1].timestamp
                  )}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="inline-block px-2 py-1 mt-2 text-xs text-white bg-red-500 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
