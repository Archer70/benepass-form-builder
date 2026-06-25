import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse a text input into a number, or `undefined` when blank or invalid. */
export function parseNumberInput(raw: string): number | undefined {
  if (raw.trim() === "") return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

/** Coerce an unknown form value to a string for controlled inputs. */
export function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}
