import { TrainingCalendarView } from "@/components/calendar/training-calendar-view";
import { trainingSessions } from "@/src/data/training-source";

export default function CalendarPage() {
  return <TrainingCalendarView seedSessions={trainingSessions} />;
}
