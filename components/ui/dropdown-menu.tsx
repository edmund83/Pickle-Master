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
            "absolute z-50 mt-2 w-56 rounded-md border border-neutral-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            align === 'end' ? "right-0" : "left-0",
            className
        )}>
            <div className="py-1">
                {children}
            </div>
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
                "block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                className
            )}
            onClick={handleClick}
        >
            {children}
        </button>
    )
}
