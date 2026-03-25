import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs) { return twMerge(clsx(inputs)) }
export const formatAddr = (a) => a ? `${a.slice(0,6)}...${a.slice(-4)}` : ''
export const formatDate = (ts) => ts ? new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
