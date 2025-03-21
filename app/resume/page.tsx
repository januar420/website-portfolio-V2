import { Metadata } from "next"
import ResumePageWrapper from "@/components/resume-page-wrapper"
import ErrorBoundary from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "Resume | Januar Galuh Prabakti",
  description: "Professional Resume for Januar Galuh Prabakti - IT & Cyber Security Enthusiast",
}

export default function ResumePage() {
  return (
    <main className="min-h-screen pt-24 pb-20">
      <ErrorBoundary fallback={<div className="container mx-auto py-10">Error loading resume page</div>}>
        <ResumePageWrapper />
      </ErrorBoundary>
    </main>
  )
}

