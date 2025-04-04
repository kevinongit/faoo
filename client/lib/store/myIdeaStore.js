"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sample initial ideas
const initialIdeas = [
  // 카테고리: 불편사항
  {
    id: "1",
    title: "온라인 신청 시 서버 오류 빈발",
    description:
      "홈택스에서 자금 지원 신청할 때마다 서버가 느리거나 오류가 발생해 신청을 완료하기 어렵습니다. 소상공인들이 급하게 자금이 필요한 상황에서 큰 불편입니다.",
    category: "불편사항",
    votes: 58,
    createdAt: "2025-03-10T09:15:00Z",
    status: "검토 중",
  },
  {
    id: "2",
    title: "사업자 상태 조회 지연",
    description:
      "사업자 상태 조회가 실시간으로 반영되지 않아 폐업 신고 후에도 정상으로 표시되는 경우가 많습니다. 시스템 업데이트가 너무 느립니다.",
    category: "불편사항",
    votes: 35,
    createdAt: "2025-03-15T14:20:00Z",
    status: "보류",
  },
  {
    id: "3",
    title: "모바일 앱 인증 복잡성",
    description:
      "소상공인 지원 앱에서 간편인증이 제대로 작동하지 않아 매번 인증서를 새로 등록해야 합니다. 간소화가 필요합니다.",
    category: "불편사항",
    votes: 47,
    createdAt: "2025-03-20T11:45:00Z",
    status: "검토 중",
  },

  // 카테고리: 새로운 아이디어
  {
    id: "4",
    title: "지역 상권 분석 툴 추가",
    description:
      "소상공인들이 상권별 매출 추이와 고객층 데이터를 볼 수 있는 간단한 분석 툴을 시스템에 추가하면 사업 운영에 큰 도움이 될 것 같습니다.",
    category: "새로운 아이디어",
    votes: 72,
    createdAt: "2025-03-12T13:00:00Z",
    status: "승인됨",
  },
  {
    id: "5",
    title: "소상공인 전용 중고 장비 거래 플랫폼",
    description:
      "폐업하거나 새로 시작하는 소상공인들이 중고 장비를 저렴하게 사고팔 수 있는 플랫폼을 정부 시스템에 연계하면 자원 낭비를 줄일 수 있을 겁니다.",
    category: "새로운 아이디어",
    votes: 29,
    createdAt: "2025-03-18T16:30:00Z",
    status: "검토 중",
  },
  {
    id: "6",
    title: "디지털 교육 콘텐츠 확대",
    description:
      "온라인 판매나 스마트 기술 도입을 위한 무료 디지털 교육 콘텐츠를 시스템에 추가해 소상공인들이 쉽게 배울 수 있게 해주세요.",
    category: "새로운 아이디어",
    votes: 53,
    createdAt: "2025-03-22T10:10:00Z",
    status: "검토 중",
  },

  // 카테고리: 요청사항
  {
    id: "7",
    title: "지원금 신청 서류 간소화",
    description:
      "경영 안정 자금 신청 시 제출해야 할 서류가 너무 많고 복잡합니다. 간단한 확인 절차로 줄여주시면 좋겠습니다.",
    category: "요청사항",
    votes: 65,
    createdAt: "2025-03-14T08:50:00Z",
    status: "승인됨",
  },
  {
    id: "8",
    title: "지역별 상담 창구 확대",
    description:
      "온라인뿐 아니라 오프라인에서 정책 상담을 받을 수 있는 지역 창구를 더 늘려주세요. 디지털에 익숙하지 않은 소상공인들이 많습니다.",
    category: "요청사항",
    votes: 41,
    createdAt: "2025-03-19T15:25:00Z",
    status: "검토 중",
  },
  {
    id: "9",
    title: "폐업 지원금 신속 지급",
    description:
      "폐업 후 재기 지원금이 승인까지 2~3개월 걸리는 경우가 많습니다. 신속하게 지급되도록 절차를 개선해 주세요.",
    category: "요청사항",
    votes: 38,
    createdAt: "2025-03-23T09:30:00Z",
    status: "보류",
  },

  // 카테고리: 기타
  {
    id: "10",
    title: "업종별 폐업률 통계 공개",
    description:
      "소상공인들이 업종별 폐업률이나 생존율 통계를 쉽게 볼 수 있게 공개해 주시면 사업 계획 세우는 데 도움이 될 것 같습니다.",
    category: "기타",
    votes: 50,
    createdAt: "2025-03-11T12:00:00Z",
    status: "검토 중",
  },
  {
    id: "11",
    title: "커뮤니티 기능 추가 제안",
    description:
      "시스템에 소상공인들이 서로 경험을 공유할 수 있는 간단한 게시판이나 채팅 기능을 추가하면 좋을 것 같습니다.",
    category: "기타",
    votes: 33,
    createdAt: "2025-03-17T17:15:00Z",
    status: "검토 중",
  },
  {
    id: "12",
    title: "정책 알림 문자 개선",
    description:
      "지원 정책 관련 문자 알림이 너무 길고 핵심이 불분명합니다. 간결하고 중요한 정보만 담아 보내주시면 좋겠습니다.",
    category: "기타",
    votes: 45,
    createdAt: "2025-03-25T14:40:00Z",
    status: "승인됨",
  },
];

export const useMyIdeaStore = create(
  persist(
    (set) => ({
      ideas: initialIdeas,

      // Add a new idea
      addIdea: (idea) =>
        set((state) => ({
          ideas: [idea, ...state.ideas],
        })),

      // Upvote an idea
      upvoteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
          ),
        })),

      // Update idea status
      updateIdeaStatus: (id, status) =>
        set((state) => ({
          ideas: state.ideas.map((idea) =>
            idea.id === id ? { ...idea, status } : idea
          ),
        })),

      // Delete an idea
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        })),
    }),
    {
      name: "idea-storage", // name of the item in localStorage
    }
  )
);
