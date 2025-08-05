"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, BarChart3, CheckCircle } from "lucide-react"
import Link from "next/link"
import { DatabaseService } from "@/lib/database"
import type { FormWithQuestions, FormResponse } from "@/types/database"

export default function ResponsesPage() {
  const params = useParams()
  const [form, setForm] = useState<FormWithQuestions | null>(null)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const db = DatabaseService.getInstance()

  useEffect(() => {
    if (params.id) {
      const formData = db.getFormWithQuestions(params.id as string)
      setForm(formData)

      const formResponses = db.getFormResponses(params.id as string)
      setResponses(formResponses)
    }
  }, [params.id])

  const exportToCSV = () => {
    if (!form || responses.length === 0) return

    const headers = form.perguntas.map((p) => p.titulo)
    const csvContent = [
      ["Data de Submissão", "ID da Resposta", ...headers].join(","),
      ...responses.map((response) =>
        [
          new Date(response.submittedAt).toLocaleString("pt-BR"),
          response.id,
          ...form.perguntas.map((pergunta) => {
            const answer = response.responses[pergunta.codigo]
            if (Array.isArray(answer)) {
              return `"${answer.join(", ")}"`
            }
            return `"${answer || ""}"`
          }),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${form.titulo}_respostas.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Formulário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-xl font-medium text-gray-900">{form.titulo}</h1>
              </div>
            </div>
            {responses.length > 0 && (
              <Button onClick={exportToCSV} className="bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total de respostas</p>
                  <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Perguntas</p>
                  <p className="text-2xl font-bold text-gray-900">{form.perguntas.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">?</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Taxa de conclusão</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {responses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma resposta ainda</h3>
              <p className="text-gray-600 mb-4">Compartilhe o link do formulário para começar a coletar respostas</p>
              <Link href={`/form/${params.id}`}>
                <Button className="bg-purple-600 hover:bg-purple-700">Ver formulário</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Resposta #{index + 1}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Enviada em {new Date(response.submittedAt).toLocaleString("pt-BR")}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.perguntas.map((pergunta) => {
                      const answer = response.responses[pergunta.codigo]
                      if (!answer && answer !== 0) return null

                      return (
                        <div key={pergunta.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-1">{pergunta.titulo}</h4>
                          <div className="text-gray-700">
                            {Array.isArray(answer) ? answer.join(", ") : String(answer)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
