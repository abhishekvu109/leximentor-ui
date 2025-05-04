"use client";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const data = [{name: "Week 1", words: 400, drills: 240}, {name: "Week 2", words: 300, drills: 139}, {
    name: "Week 3",
    words: 200,
    drills: 980
}, {name: "Week 4", words: 278, drills: 390}];

export default function BarChartWidget() {
    return (<div className="h-[375px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend/>
                    <Bar dataKey="words" stackId="a" fill="#8884d8"/>
                    <Bar dataKey="drills" stackId="a" fill="#82ca9d"/>
                </BarChart>
            </ResponsiveContainer>
        </div>);
}
