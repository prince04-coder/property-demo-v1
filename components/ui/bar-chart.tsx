"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartProps {
  data: Record<string, any>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showLegend?: boolean;
  showAnimation?: boolean;
}

const DEFAULT_COLORS = ["blue", "emerald", "orange", "rose", "indigo", "amber"];

export function BarChart({
  data,
  index,
  categories,
  colors = DEFAULT_COLORS,
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showLegend = true,
  showAnimation = true,
}: BarChartProps) {
  // Map color names to Tailwind CSS colors
  const getColorValue = (colorName: string, index: number) => {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      emerald: "#10b981",
      orange: "#f97316",
      rose: "#f43f5e",
      indigo: "#6366f1",
      amber: "#f59e0b",
      red: "#ef4444",
      green: "#22c55e",
      purple: "#a855f7",
      sky: "#0ea5e9",
      yellow: "#eab308",
    };

    return (
      colorMap[colorName.toLowerCase()] ||
      colorMap[DEFAULT_COLORS[index % DEFAULT_COLORS.length]]
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} className="overflow-visible">
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />
        <XAxis
          dataKey={index}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          style={{
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => valueFormatter(value)}
          width={yAxisWidth}
          tickMargin={10}
          style={{
            fontSize: "12px",
            fontFamily: "inherit",
          }}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          labelStyle={{ color: "hsl(240, 10%, 3.9%)" }}
          itemStyle={{ color: "hsl(240, 10%, 3.9%)" }}
          contentStyle={{
            backgroundColor: "hsl(0, 0%, 100%)",
            border: "1px solid hsl(240, 5%, 84%)",
            borderRadius: "6px",
            boxShadow:
              "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{
              fontSize: "12px",
              paddingTop: "8px",
            }}
          />
        )}
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId={category}
            fill={getColorValue(colors[index], index)}
            radius={[4, 4, 0, 0]}
            {...(showAnimation && {
              isAnimationActive: true,
              animationDuration: 800,
              animationEasing: "ease-out",
            })}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
