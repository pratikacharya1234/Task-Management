import { FeatureGenerator } from '@/components/generation/FeatureGenerator'

interface GeneratePageProps {
  params: {
    id: string
  }
}

export default function GeneratePage({ params }: GeneratePageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <FeatureGenerator projectId={params.id} />
    </div>
  )
}

export const metadata = {
  title: 'Generate Feature | FORGE',
  description: 'Generate complete, production-ready features with AI',
}
