import { Treemap, Tooltip, ResponsiveContainer } from "recharts";

// 색상 팔레트
const COLORS = ["#8C9EFF", "#81C784", "#FF8A65", "#FFD54F", "#90CAF9"];

const CustomTreemapContent = (props) => {
  const {
    x, y, width, height, name, index, value, colors, root,
  } = props;

  const percent = ((value / root.value) * 100).toFixed(1); // 비율 계산

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: "#fff",
          strokeWidth: 2,
        }}
      />
      {width > 60 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 6}
          textAnchor="middle"
          fontSize={13}
          fill="#fff"
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {width > 60 && height > 40 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fontSize={12}
          fill="#fff"
        >
          {`${percent}%`}
        </text>
      )}
    </g>
  );
};

export default CustomTreemapContent;