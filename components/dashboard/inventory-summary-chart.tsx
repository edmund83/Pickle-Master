'use client'

import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

interface InventorySummaryChartProps {
    data: {
        name: string
        value: number
        color: string
    }[]
}

export function InventorySummaryChart({ data }: InventorySummaryChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

    // Only render chart when container is visible and has dimensions
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Check initial dimensions
        const rect = container.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
            setDimensions({ width: rect.width, height: rect.height })
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                if (width > 0 && height > 0) {
                    setDimensions({ width, height })
                } else {
                    setDimensions(null)
                }
            }
        })

        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    if (data.every(d => d.value === 0)) {
        return (
            <div className="flex h-[300px] items-center justify-center text-neutral-400 text-sm">
                No inventory data available
            </div>
        )
    }

    return (
        <div ref={containerRef} className="h-[300px] w-full">
            {dimensions && (
                <PieChart width={dimensions.width} height={dimensions.height}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            )}
        </div>
    )
}
