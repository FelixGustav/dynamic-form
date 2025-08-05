"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { FormBuilder } from "@/components/form-builder"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DatabaseService } from "@/lib/database"
import type { FormWithQuestions } from "@/types/database"

export default function EditFormPage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState<FormWithQuestions | null>(null)
  const db = DatabaseService.getInstance()

  useEffect(() => {
    if (params.id) {
      const form = db.getFormWithQuestions(params.id as string)
      setFormData(form)
    }
  }, [params.id])

  const handleSave = () => {
    router.push("/")
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          </div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h1 className="text-xl font-medium text-gray-900">{formData.titulo}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormBuilder initialData={formData} onSave={handleSave} />
      </div>
    </div>
  )
}
