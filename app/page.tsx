import { HomeView } from "@/components/home/home-view";
import { bodyChecks, nutritionChecks } from "@/lib/mock-data";
import { trainingSessions } from "@/src/data/training-source";

export default function HomePage() {
  return <HomeView sessions={trainingSessions} bodyChecks={bodyChecks} nutritionChecks={nutritionChecks} />;
}
