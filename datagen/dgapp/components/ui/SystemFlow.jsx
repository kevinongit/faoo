"use client";

import {ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType, Position} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import useFlowStore from "../../app/store/useFlowStore";
import customFlowNode from "./CustomFlowNode";

import "./xy-theme.css";
// const initialNodes = [
//   {
//     id: "start",
//     type: "input",
//     data: {label: "데이터 생성 준비"},
//     position: {x: 25, y: 0},
//     style: {width: 120, height: 60, border: "2px solid #FFB8E0", background: "#FFEDFA"}
//   },
//   {
//     id: "gd",
//     data: {label: "매출데이터 생성"},
//     position: {x: 10, y: 110}
//   },
//   {
//     id: "datasave",
//     type: "customNode", // 커스텀 노드 타입 사용
//     data: {label: "매출 데이터 저장", connectposition: [Position.Top, Position.Right, Position.Bottom]},
//     position: {x: 10, y: 220},
//     style: {width: 150, height: 40}
//   },

//   {
//     id: "db1",
//     position: {x: 10, y: 330},
//     data: {
//       label: (
//         <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
//           <span>매출 데이터</span>
//           <Image
//             src="/db.png"
//             alt="Database"
//             width={24}
//             height={24}
//             style={{objectFit: "contain"}}
//           />
//         </div>
//       )
//     },

//     style: {
//       background: "#f5f5f5",
//       border: "1px solid #1a192b",
//       borderRadius: "10px",
//       padding: "10px",
//       width: 150
//     }
//   },
//   {
//     id: "peerdata",
//     data: {label: "비교군 데이터 생성"},
//     position: {x: 250, y: 0},
//     style: {width: 120, height: 60}
//   },

//   {
//     id: "db2",
//     type: "customNode", // 커스텀 노드 타입 사용
//     data: {
//       label: (
//         <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
//           <span>매출 분석 데이터</span>
//           <Image
//             src="/db.png"
//             alt="Database"
//             width={24}
//             height={24}
//             style={{objectFit: "contain"}}
//           />
//         </div>
//       ),
//       connectposition: [Position.Top, Position.Left, Position.Bottom]
//     },
//     position: {x: 235, y: 240},
//     style: {
//       background: "#f5f5f5",
//       border: "1px solid #1a192b",
//       borderRadius: "10px",
//       padding: "10px",
//       width: 150
//     }
//   }
// ];

// const initialEdges = [
//   {id: "e-start-gd", source: "start", target: "gd", type: "smoothstep"},
//   {id: "e-gd-datasave", source: "gd", target: "datasave", type: "smoothstep"},
//   {id: "e-datasave-db1", source: "datasave", target: "db1", type: "smoothstep"},
//   // {
//   //   id: "e-datasave-db2",
//   //   source: "datasave",
//   //   target: "db2",
//   //   sourceHandle: "right-source",
//   //   targetHandle: "left-target",
//   //   type: "smoothstep"
//   // }
//   {id: "e-peerdata-db2", source: "peerdata", target: "db2", type: "smoothstep"}
//   //{id: "e-datasave-db2-1", source: "datasave2", sourceHandle: "right", target: "db2", type: "smoothstep"}
// ];

const flowPaths = {
  start: ["e-start-gd"],
  sales_data: ["e-gd-datasave"],
  sales_data_save: ["e-datasave-db1"],
  sales_data_analysis: ["e-datasave-db2"],
  peer_data: ["e-db1-peerdata"],
  peer_data_save: ["e-peerdata-db2"]
};

const nodeTypes = {
  customNode: customFlowNode
};
export default function SystemFlow() {
  const activePaths = useFlowStore((state) => state.activePaths);
  const setActivePaths = useFlowStore((state) => state.setActivePaths);
  const nodesStore = useFlowStore((state) => state.nodes);
  const edgesStore = useFlowStore((state) => state.edges);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesStore);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesStore);

  //컴포넌트 렌더링시
  useEffect(() => {
    if (nodesStore.length > 0) {
      setNodes(nodesStore);
    }
  }, [nodesStore]);

  //노드 및 엣지 변경시 store에 저장
  useEffect(() => {
    if (edgesStore.length > 0) {
      setEdges(edgesStore);
    }
  }, [edgesStore]);

  //activePaths 변경시 "peer_data" 가 있으면 앳지 연결과 애니메이션 효과 추가
  useEffect(() => {
    setEdges((eds) => {
      if (activePaths.includes("peer_data") && !eds.some((edge) => edge.id === "e-db1-peerdata")) {
        return [...eds, {id: "e-db1-peerdata", source: "db1", target: "peerdata", type: "smoothstep"}];
      }
      return eds;
    });
  }, [activePaths]);

  const getEdgeStyle = useCallback(
    (edge) => {
      const isActive = activePaths.some((path) => flowPaths[path].includes(edge.id));
      return {
        stroke: isActive ? "#4a90e2" : "#b1b1b7",
        strokeWidth: isActive ? 3 : 2,
        strokeDasharray: isActive ? "5,5" : "none",
        animation: isActive ? "flowAnimation 1s linear infinite" : "none"
      };
    },
    [activePaths]
  );

  const edgesWithStyle = edges.map((edge) => {
    const isActive = activePaths.some((path) => flowPaths[path].includes(edge.id));
    // console.log("s ===============");
    // console.log("activePaths", activePaths);
    // console.log("flowPaths", flowPaths);
    // console.log("edge", edge);

    // console.log("e ===============");
    const markerStyle = {
      color: isActive ? "#4a90e2" : "#b1b1b7",
      width: 6,
      height: 6
    };

    let markerEnd = undefined;
    let markerStart = undefined;

    const defaultEdgeStyle = {
      ...edge,
      style: getEdgeStyle(edge),
      animated: isActive,
      markerStart,
      markerEnd
    };

    let edgeStyle = defaultEdgeStyle;

    if (isActive) {
      markerEnd = {...markerStyle, type: MarkerType.ArrowClosed};
      edgeStyle = {
        ...defaultEdgeStyle,
        markerEnd: markerEnd
      };

      if (activePaths.includes("peer_data") && edge.id === "e-db1-peerdata") {
        markerEnd = {...markerStyle, type: MarkerType.ArrowClosed};
        markerStart = {...markerStyle, type: MarkerType.ArrowClosed};
        edgeStyle = {
          ...defaultEdgeStyle,
          markerStart: markerStart,
          markerEnd: markerEnd
        };
      }
    }
    return edgeStyle;
  });

  return (
    <div style={{width: "100%", height: "100%", border: "1px solid #ddd", borderRadius: "8px"}}>
      <style>
        {`
          @keyframes flowAnimation {
            from {
              stroke-dashoffset: 10;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      <ReactFlow
        key={nodes.length}
        nodes={nodes}
        edges={edgesWithStyle}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        defaultViewport={{x: 0, y: 35, zoom: 1}}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{hideAttribution: true}}
        nodeTypes={nodeTypes}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

SystemFlow.propTypes = {
  activePaths: PropTypes.array.isRequired
};
