import { HomeView } from "@/components/home-view";
import { getPortfolio } from "@/lib/github";

export default async function Home() {
  const { projects, user } = await getPortfolio();
  return <HomeView projects={projects} user={user} />;
}
