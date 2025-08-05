"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { FormRenderer } from "@/components/form-renderer"
import { DatabaseService } from "@/lib/database"
import type { FormWithQuestions } from "@/types/database"

export default function FormPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<FormWithQuestions | null>(null)
  const db = DatabaseService.getInstance()

  useEffect(() => {
    if (params.id) {
      const formData = db.getFormWithQuestions(params.id as string)
      setForm(formData)
    }
  }, [params.id])

  const handleSubmit = (responses: Record<string, any>) => {
    if (!form) return

    const response = {
      id: db.generateId(),
      formId: form.id,
      responses,
      submittedAt: new Date().toISOString(),
    }

    db.saveFormResponse(response)
    router.push("/success")
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          </div>
          <p className="text-gray-600">Formulário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FormRenderer form={form} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
