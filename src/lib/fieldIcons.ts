import {
  Type,
  AlignLeft,
  Hash,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  Calendar,
  type LucideIcon,
} from 'lucide-react'
import type { FieldType } from './types'

/** Icon per field type, shared by the palette and the field list. */
export const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  select: ChevronDownSquare,
  radio: CircleDot,
  checkbox: CheckSquare,
  date: Calendar,
}
