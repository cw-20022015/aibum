"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, Calendar, Users } from "lucide-react"

interface FilterMenuProps {
  onFilterChange: (filterType: 'date' | 'people') => void
}

export function FilterMenu({ onFilterChange }: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onFilterChange('date')} className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>날짜순 정렬</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('people')} className="gap-2">
          <Users className="h-4 w-4" />
          <span>인물별 그룹</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 