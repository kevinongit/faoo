import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart as RechartsBarChart, Bar } from "recharts";

export const LineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsLineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="total" stroke="#8884d8" />
    </RechartsLineChart>
  </ResponsiveContainer>
);

export const BarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="platform" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="totalSales" fill="#8884d8" />
    </RechartsBarChart>
  </ResponsiveContainer>
);
