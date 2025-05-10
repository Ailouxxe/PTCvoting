import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

// Bar Chart Component
interface BarChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  height?: number;
  colors?: string[];
  xAxisKey?: string;
  valueKey?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  colors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"],
  xAxisKey = "name",
  valueKey = "value",
  showGrid = true,
  showLegend = false,
  className,
}) => {
  return (
    <div className={`w-full h-[${height}px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          {showLegend && <Legend />}
          <Bar dataKey={valueKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  height?: number;
  colors?: string[];
  nameKey?: string;
  valueKey?: string;
  showLegend?: boolean;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  colors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--chart-1, 210 100% 50%))",
    "hsl(var(--chart-2, 40 100% 50%))",
    "hsl(var(--chart-3, 140 100% 50%))",
    "hsl(var(--chart-4, 270 100% 50%))",
    "hsl(var(--chart-5, 330 100% 50%))",
  ],
  nameKey = "name",
  valueKey = "value",
  showLegend = true,
  className,
}) => {
  // Generate more colors if needed
  const extendedColors = [...colors];
  while (extendedColors.length < data.length) {
    extendedColors.push(colors[extendedColors.length % colors.length]);
  }

  return (
    <div className={`w-full h-[${height}px] ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={extendedColors[index % extendedColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
