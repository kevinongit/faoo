"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Menu,
  Plus,
  Send,
  FileText,
  FileSpreadsheet,
  LetterText,
  Download,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInMinutes, parseISO, addDays, format } from "date-fns";
import { sendMessage, markAllRead } from "@/lib/api";
import useSocketStore from "@/store/socketStore";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion"; // 애니메이션 라이브러리 추가

export default function ChatRoom({ chatId }) {
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);
  const messagesEndRef = useRef(null);

  const { getSelectedChat, addMessage, updateUnreadCount } = useChatStore();
  const user = useAuthStore((state) => state.user);

  const selectedChat = getSelectedChat();

  useEffect(() => {
    if (socket) {
      const handleNewMessage = async (message) => {
        console.log("new-message:", message);
        if (message.to === chatId || message.to === user.id) {
          addMessage(chatId, message);
          if (message.from !== user.id) {
            await markAllRead({ userId: user.id, chatId });
          }
        }
      };

      socket.on("new-message", handleNewMessage);
      return () => socket.off("new-message", handleNewMessage);
    }
  }, [socket, chatId, user.id, addMessage, updateUnreadCount]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      await markAllRead({ userId: user.id, chatId });
      updateUnreadCount(chatId, 0);
    };
    markMessagesAsRead();
  }, [chatId, updateUnreadCount, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const message = {
        from: user.id,
        to: chatId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      await sendMessage(user.id, chatId, newMessage, "text");
      addMessage(chatId, message);
      setNewMessage("");
    }
  };

  const shouldShowAvatar = (message, index, messages) => {
    if (message.from === user.id) return false;
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (prevMessage.from !== message.from) return true;
    const timeDiff = differenceInMinutes(
      parseISO(message.timestamp),
      parseISO(prevMessage.timestamp)
    );
    return timeDiff >= 1;
  };

  const renderFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText size={24} />;
      case "xlsx":
        return <FileSpreadsheet size={24} />;
      case "docx":
        return <LetterText size={24} />;
      default:
        return null;
    }
  };

  // 알림 테마 결정 함수
  const getNotificationTheme = (title) => {
    if (title.includes("매출 상승") || title.includes("이벤트")) {
      return {
        bg: "bg-green-50",
        border: "border-green-100",
        text: "text-green-700",
        iconColor: "text-green-500",
        buttonBg: "bg-green-500",
        buttonHover: "hover:bg-green-600",
      };
    } else if (title.includes("신용정보")) {
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-100",
        text: "text-yellow-700",
        iconColor: "text-yellow-500",
        buttonBg: "bg-yellow-500",
        buttonHover: "hover:bg-yellow-600",
      };
    } else {
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        text: "text-blue-700",
        iconColor: "text-blue-500",
        buttonBg: "bg-blue-500",
        buttonHover: "hover:bg-blue-600",
      };
    }
  };

  const renderMessage = (message, index, messages) => {
    const isOwnMessage = message.from === user.id;
    const showAvatar =
      !isOwnMessage && shouldShowAvatar(message, index, messages);

    if (message.type === "text") {
      return (
        <div
          key={index}
          className={`mb-4 flex ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          {showAvatar && (
            <Avatar className="flex-shrink-0 mr-2">
              <AvatarImage
                src={`/images/users/${message.from}.jpg`}
                alt={message.from}
              />
              <AvatarFallback>{message.from[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={`p-2 rounded-lg ${
              isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {message.content}
          </div>
        </div>
      );
    } else if (["pdf", "xlsx", "docx"].includes(message.type)) {
      const {
        title,
        desc,
        path = "/pdf/",
        filename,
        from = new Date(),
        to = addDays(new Date(), 10),
      } = message;
      return (
        <div
          key={index}
          className={`mb-4 flex ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          {showAvatar && (
            <Avatar className="flex-shrink-0 mr-2">
              <AvatarImage
                src={`/images/users/${message.from}.jpg`}
                alt={message.from}
              />
              <AvatarFallback>{message.from[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={`p-2 rounded-lg ${
              isOwnMessage ? "bg-blue-200" : "bg-yellow-100"
            } flex items-center h-24`}
          >
            <div className="flex-1">
              <div className="h-12 overflow-hidden font-semibold">{title}</div>
              <div className="h-6 text-xs text-gray-500">
                유효기간: ~ {format(to, "yyyy.MM.dd")}
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              {renderFileIcon(message.type)}
              <Button
                size="sm"
                variant="ghost"
                className="mt-1"
                onClick={() => window.open(`${path}${filename}`, "_blank")}
              >
                <Download size={16} />
              </Button>
            </div>
          </div>
        </div>
      );
    } else if (message.type === "notification") {
      const { title, content, link_title, link_uri } = message;
      const theme = getNotificationTheme(title);
      console.log(link_uri);
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`mb-4 flex ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          {showAvatar && (
            <Avatar className="flex-shrink-0 mr-2">
              <AvatarImage
                src={`/images/users/${message.from}.jpg`}
                alt={message.from}
              />
              <AvatarFallback>{message.from[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div
            className={`max-w-sm p-4 rounded-lg ${theme.bg} ${
              theme.border
            } shadow-md ${isOwnMessage ? "text-right" : "text-left"}`}
          >
            <div className="flex items-center mb-2">
              <Bell size={16} className={`${theme.iconColor} mr-2`} />
              <div className={`text-sm font-semibold ${theme.text}`}>
                {title}
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-3">{content}</div>
            {link_title && link_uri && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="solid"
                  size="sm"
                  className={`w-full ${theme.buttonBg} text-white ${theme.buttonHover} transition-all duration-200`}
                  onClick={() => window.open(link_uri, "_blank")}
                >
                  {link_title}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (!selectedChat) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <h2 className="text-lg font-semibold">{selectedChat.with}</h2>
        <div>
          <Search className="inline-block mr-4 cursor-pointer" />
          <Menu className="inline-block cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedChat.messages.map((message, index, messages) =>
          renderMessage(message, index, messages)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-4 bg-white border-t">
        <Plus className="mr-2 cursor-pointer" />
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 mr-2"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
