"use client";
import {PieChart, Pie, Tooltip, Cell, Legend} from "recharts";

const data = [{name: "Words Learnt", value: 400}, {name: "Drill Completed", value: 300}, {
    name: "Challenges Completed",
    value: 300
}, {name: "Pending", value: 200},];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PieChartWidget() {
    return (<div className="flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg ">
            <PieChart width={375} height={375}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                </Pie>
                <Tooltip/>
                <Legend verticalAlign="bottom" className="text-sm" />
            </PieChart>
        </div>);
}
