"use client"

import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import "react-tooltip/dist/react-tooltip.css"
import { endOfToday, subMonths, format } from "date-fns"
import type { CheckinsMap } from "../utils/streak"
import "../styles/heatmap.css"
import { Tooltip } from "react-tooltip"

export default function Heatmap({ checkins }: { checkins: CheckinsMap }) {
  const values = Object.keys(checkins).map((date) => ({
    date,
    count: checkins[date] ? 1 : 0,
  }))

  return (
    <div className="heatmap-container">
      <CalendarHeatmap
        startDate={subMonths(endOfToday(), 3)}
        endDate={endOfToday()}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === undefined) return "color-empty"
          return value.count > 0 ? "color-filled" : "color-empty"
        }}
        gutterSize={2}
        showWeekdayLabels
        showOutOfRangeDays={false}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) {
            // Cast to satisfy Record<string, string> signature
            return {} as Record<string, string>
          }
          const date = new Date(value.date)
          return {
            "data-tooltip-id": "habit-heatmap-tooltip",
            "data-tooltip-content": `${format(date, "MMM d, yyyy")}: ${
              value.count ? "Completed" : "Not completed"
            }`,
          }
        }}
      />
      <Tooltip id="habit-heatmap-tooltip" />
    </div>
  )
}
