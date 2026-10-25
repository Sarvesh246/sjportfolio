import { HomeView } from "@/components/home-view";
import { getPortfolio } from "@/lib/github";
import { getThumbnails, withThumbnails } from "@/lib/thumbnails";

export default async function Home() {
  const [{ projects, user }, thumbs] = await Promise.all([getPortfolio(), getThumbnails()]);
  return <HomeView projects={withThumbnails(projects, thumbs)} user={user} />;
}
