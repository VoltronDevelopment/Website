import { ProjectDetail } from "@/components/admin/ProjectDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminProjectPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}
