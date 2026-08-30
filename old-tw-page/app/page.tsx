import { LaunchPageClient } from "@/components/LaunchPageClient";
import { getContentFiles } from "@/lib/content-index";

export default async function Home() {
  const contentFiles = await getContentFiles();
  
  return <LaunchPageClient contentFiles={contentFiles} />;
}
