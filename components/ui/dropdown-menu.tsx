'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
    children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null)

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [ref])

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div ref={ref} className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context) throw new Error("Trigger must be used within DropdownMenu")

    // If asChild is true, we should clone the child and add onClick. 
    // For simplicity here, we wrap if not asChild, or clone if asChild.
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                (children as React.ReactElement<any>).props.onClick?.(e)
                context.setOpen(!context.open)
            }
        })
    }

    return (
        <button onClick={() => context.setOpen(!context.open)}>
            {children}
        </button>
    )
}

export function DropdownMenuContent({ children, align = 'end', className }: { children: React.ReactNode; align?: 'start' | 'end'; className?: string }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context || !context.open) return null

    return (
        <div className={cn(
            "absolute z-50 mt-1 min-w-[180px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg",
            align === 'end' ? "right-0" : "left-0",
            className
        )}>
            {children}
        </div>
    )
}

export function DropdownMenuItem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
    const context = React.useContext(DropdownMenuContext)

    const handleClick = () => {
        onClick?.()
        context?.setOpen(false)
    }

    return (
        <button
            className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50",
                className
            )}
            onClick={handleClick}
        >
            {children}
        </button>
    )
}

export function DropdownMenuCheckboxItem({
    children,
    className,
    checked,
    onCheckedChange
}: {
    children: React.ReactNode
    className?: string
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onCheckedChange?.(!checked)
    }

    return (
        <button
            className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-50",
                className
            )}
            onClick={handleClick}
        >
            <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded border",
                checked ? "border-primary bg-primary" : "border-neutral-300"
            )}>
                {checked && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </span>
            {children}
        </button>
    )
}

export function DropdownMenuSeparator() {
    return <div className="my-1 h-px bg-neutral-200" />
}

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "px-3 py-1.5 text-xs font-medium text-neutral-500",
            className
        )}>
            {children}
        </div>
    )
}
