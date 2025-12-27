'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useFormatting } from '@/hooks/useFormatting'

interface InventoryValueChartProps {
    data: {
        name: string
        value: number
    }[]
}

export function InventoryValueChart({ data }: InventoryValueChartProps) {
    const { formatCurrency, currencySymbol } = useFormatting()

    if (data.length === 0 || data.every(d => d.value === 0)) {
        return (
            <div className="flex h-[300px] items-center justify-center text-neutral-400 text-sm">
                No value data available
            </div>
        )
    }

    // Sort by value desc and take top 5 to keep chart clean
    const chartData = [...data].sort((a, b) => b.value - a.value).slice(0, 5)

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `${currencySymbol}${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [formatCurrency(value as number), 'Value']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill="#10B981" /> /* Pickle Green */
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
