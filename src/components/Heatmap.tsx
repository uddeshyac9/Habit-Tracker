import CalendarHeatmap from "react-calendar-heatmap"
import "react-calendar-heatmap/dist/styles.css"
import { endOfToday, subMonths } from "date-fns"
import type { CheckinsMap } from "../utils/streak"
import "../styles/heatmap.css"

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
        showWeekdayLabels={true}
        showOutOfRangeDays={false}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) return null
          return {
            "data-tip": `${value.date}: ${value.count ? "Completed" : "Not completed"}`,
          }
        }}
      />
    </div>
  )
}
