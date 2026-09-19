// Re-export cn from utils for shadcn/ui component compatibility.
// shadcn/ui components import from '@/lib/utils', so this re-export
// ensures all component imports resolve correctly.
export { cn } from '@/utils/cn';
