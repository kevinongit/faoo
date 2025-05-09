"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { DGSV2_URL } from "../constants/api";

async function fetchUsers() {
  try {
    const response = await fetch(`${DGSV2_URL}/users`);
    const users = await response.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

async function checkGenIntelAvailable(business_number) {
  try {
    const response = await fetch(
      `${DGSV2_URL}/check-gen-intel?business_number=${business_number}`
    );
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking intel availability:", error);
    return false;
  }
}

async function checkCompareIntelAvailable(address, sector) {
  try {
    const response = await fetch(
      `${DGSV2_URL}/check-compare-intel?address=${address}&sector=${sector}`
    );
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking compare intel availability:", error);
    return false;
  }
}

export default function IntelGenPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isGenAvailable, setIsGenAvailable] = useState(false);
  const [isCompareAvailable, setIsCompareAvailable] = useState(false);
  const [stepStatus, setStepStatus] = useState({
    generate: false,
    view: false,
    analyze: false,
    compare: false,
  });

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const checkAvailability = async () => {
        const genAvailable = await checkGenIntelAvailable(
          selectedUser.business_number
        );
        const compareAvailable = await checkCompareIntelAvailable(
          selectedUser.address,
          selectedUser.sector
        );
        setIsGenAvailable(genAvailable);
        setIsCompareAvailable(compareAvailable);
      };
      checkAvailability();
    }
  }, [selectedUser]);

  const handleGenerate = async () => {
    // TODO: Implement generate functionality
    setStepStatus((prev) => ({ ...prev, generate: true }));
  };

  const handleView = async () => {
    // TODO: Implement view functionality
    setStepStatus((prev) => ({ ...prev, view: true }));
  };

  const handleAnalyze = async () => {
    // TODO: Implement analyze functionality
    setStepStatus((prev) => ({ ...prev, analyze: true }));
  };

  const handleCompare = async () => {
    // TODO: Implement compare functionality
    setStepStatus((prev) => ({ ...prev, compare: true }));
  };

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle size={16} /> 완료
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock size={16} /> 대기
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>시뮬레이션 데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Select onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.business_number} value={user}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedUser || stepStatus.generate}
                >
                  생성
                </Button>
                {getStatusBadge(stepStatus.generate)}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleView}
                  disabled={!stepStatus.generate || stepStatus.view}
                >
                  조회
                </Button>
                {getStatusBadge(stepStatus.view)}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!stepStatus.view || stepStatus.analyze}
                >
                  수집 및 분석
                </Button>
                {getStatusBadge(stepStatus.analyze)}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleCompare}
                  disabled={!stepStatus.analyze || stepStatus.compare}
                >
                  비교데이터 생성
                </Button>
                {getStatusBadge(stepStatus.compare)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
