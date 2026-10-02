"use client";

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

type Daily = { day: string; poseChecks: number; sessions: number; minutes: number };
type Accuracy = { attempt: number; pose: string; confidence: number };

const grid = <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />;

export function ActivityChart({ data }: { data: Daily[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        {grid}
        <XAxis dataKey="day" fontSize={12} tickLine={false} />
        <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="poseChecks" name="Pose checks" fill="#20a385" radius={[4, 4, 0, 0]} />
        <Bar dataKey="sessions" name="Meditation sessions" fill="#aeead5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MinutesChart({ data }: { data: Daily[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        {grid}
        <XAxis dataKey="day" fontSize={12} tickLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v) => [`${v} min`, "Mindful minutes"]} />
        <Bar dataKey="minutes" name="Mindful minutes" fill="#14836c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AccuracyChart({ data }: { data: Accuracy[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        {grid}
        <XAxis dataKey="attempt" fontSize={12} tickLine={false} label={{ value: "Attempt", position: "insideBottom", offset: -2, fontSize: 12 }} />
        <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} unit="%" />
        <Tooltip formatter={(v, _n, item) => [`${v}%`, item?.payload?.pose ?? "Confidence"]} />
        <Line type="monotone" dataKey="confidence" stroke="#20a385" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
