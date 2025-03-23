"use client";

import {Position} from "@xyflow/react";
import {create} from "zustand";
import Image from "next/image";
const initialNodes = [
  {
    id: "start",
    type: "input",
    data: {label: "데이터 생성 준비"},
    position: {x: 25, y: 0},
    style: {width: 120, height: 60, border: "2px solid #FFB8E0", background: "#FFEDFA"}
  },
  {
    id: "gd",
    data: {label: "매출데이터 생성"},
    position: {x: 10, y: 110}
  },
  {
    id: "datasave",
    type: "customNode", // 커스텀 노드 타입 사용
    data: {label: "매출 데이터 저장", connectposition: [Position.Top, Position.Right, Position.Bottom]},
    position: {x: 10, y: 220},
    style: {width: 150, height: 40}
  },

  {
    id: "db1",
    position: {x: 10, y: 330},
    data: {
      label: (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
          <span>매출 데이터</span>
          <Image
            src="/db.png"
            alt="Database"
            width={24}
            height={24}
            style={{objectFit: "contain"}}
          />
        </div>
      )
    },

    style: {
      background: "#f5f5f5",
      border: "1px solid #1a192b",
      borderRadius: "10px",
      padding: "10px",
      width: 150
    }
  },
  {
    id: "peerdata",
    data: {label: "비교군 데이터 생성"},
    position: {x: 250, y: 0},
    style: {width: 120, height: 60}
  },

  {
    id: "db2",
    type: "customNode", // 커스텀 노드 타입 사용
    data: {
      label: (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
          <span>매출 분석 데이터</span>
          <Image
            src="/db.png"
            alt="Database"
            width={24}
            height={24}
            style={{objectFit: "contain"}}
          />
        </div>
      ),
      connectposition: [Position.Top, Position.Left, Position.Bottom]
    },
    position: {x: 235, y: 240},
    style: {
      background: "#f5f5f5",
      border: "1px solid #1a192b",
      borderRadius: "10px",
      padding: "10px",
      width: 150
    }
  }
];
const initialEdges = [
  {id: "e-start-gd", source: "start", target: "gd", type: "smoothstep"},
  {id: "e-gd-datasave", source: "gd", target: "datasave", type: "smoothstep"},
  {id: "e-datasave-db1", source: "datasave", target: "db1", type: "smoothstep"},
  // {
  //   id: "e-datasave-db2",
  //   source: "datasave",
  //   target: "db2",
  //   sourceHandle: "right-source",
  //   targetHandle: "left-target",
  //   type: "smoothstep"
  // }
  {id: "e-peerdata-db2", source: "peerdata", target: "db2", type: "smoothstep"}
  //{id: "e-datasave-db2-1", source: "datasave2", sourceHandle: "right", target: "db2", type: "smoothstep"}
];

const useFlowStore = create((set) => ({
  activePaths: [], // 명령어 저장
  setActivePaths: (paths) => set({activePaths: paths}),
  addPath: (path) => set((state) => ({activePaths: [...state.activePaths, path]})),
  removePath: (path) => set((state) => ({activePaths: state.activePaths.filter((p) => p !== path)})),
  nodes: initialNodes, // 초기 노드 상태
  setNodes: (nodes) => set({nodes}),
  edges: initialEdges, // 초기 엣지 상태
  onNodesChange: null, // 혹은 초기 이벤트 핸들러로 설정
  setOnNodesChange: (onNodesChange) => set({onNodesChange}),
  onEdgesChange: null,
  setOnEdgesChange: (onEdgesChange) => set({onEdgesChange}),
  addEdge: (edge) =>
    set((state) => {
      if (state.edges.some((e) => e.id === edge.id)) {
        return state.edges;
      }
      return {edges: [...state.edges, edge]};
    }),
  removeEdge: (edgeId) => set((state) => ({edges: state.edges.filter((e) => e.id !== edgeId)}))
}));

export default useFlowStore;
