import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { endOfToday, subMonths } from 'date-fns'
import { CheckinsMap } from '../utils/streak'

export default function Heatmap({ checkins }: { checkins: CheckinsMap }) {
  const values = Object.keys(checkins).map(date => ({
    date,
    count: checkins[date] ? 1 : 0,
  }))

  return (
    <CalendarHeatmap
      startDate={subMonths(endOfToday(), 5)}
      endDate={endOfToday()}
      values={values}
      classForValue={v => (!v ? 'color-empty' : v.count ? 'color-git' : 'color-empty')}
      gutterSize={2}
      showWeekdayLabels={false}
    />
  )
}
