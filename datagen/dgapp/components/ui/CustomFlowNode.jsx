import React from "react";
import {Handle, Position} from "@xyflow/react";

import "./xy-theme.css";

const CustomFlowNode = ({data}) => {
  return (
    <div>
      <div>{data.label}</div>
      {data.connectposition.map((position) => {
        return (
          <div key={position}>
            <Handle
              type="source"
              position={position}
              id={position + "-source"}
            />
            <Handle
              type="target"
              position={position}
              id={position + "-target"}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CustomFlowNode;
