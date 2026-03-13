'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const id = useId();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-flex">
            <div
                ref={triggerRef}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        setIsOpen(!isOpen);
                    }
                }}
                className="cursor-help"
                aria-describedby={id}
                tabIndex={0}
            >
                {children}
            </div>
            {isOpen && (
                <div
                    ref={tooltipRef}
                    id={id}
                    role="tooltip"
                    className={cn(
                        'absolute z-50 max-w-xs px-3 py-2 text-xs leading-relaxed',
                        'bg-zinc-800 text-zinc-200 rounded-lg border border-zinc-700/50',
                        'shadow-xl shadow-black/30 animate-fade-in',
                        side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
                        side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
                        side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
                        side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
                        className
                    )}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
