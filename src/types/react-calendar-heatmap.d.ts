// src/types/react-calendar-heatmap.d.ts
declare module "react-calendar-heatmap" {
    import { ComponentType, SVGProps } from "react"
  
    export interface CalendarHeatmapProps extends SVGProps<SVGSVGElement> {
      startDate: Date
      endDate: Date
      values: Array<{ date: string; count: number }>
      classForValue?: (value?: { date: string; count: number }) => string
      gutterSize?: number
      showWeekdayLabels?: boolean
      showOutOfRangeDays?: boolean
      tooltipDataAttrs?: (
        value?: { date: string; count: number }
      ) => Record<string, string>
    }
  
    const CalendarHeatmap: ComponentType<CalendarHeatmapProps>
    export default CalendarHeatmap
  }
  