import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";

const formatYAxis = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value;
};

export const LineChart = ({ data, height, xAxisTickFormatter }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={xAxisTickFormatter} />
        <YAxis tickFormatter={formatYAxis} width={80} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#8884d8" />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export const BarChart = ({ data, height, xAxisTickFormatter }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="platform" tickFormatter={xAxisTickFormatter} />
        <YAxis tickFormatter={formatYAxis} width={80} tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalSales" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
