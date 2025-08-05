"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, ArrowLeft, AlertCircle } from "lucide-react"
import type { FormWithQuestions, PerguntaWithOptions } from "@/types/database"
import { DatabaseService } from "@/lib/database"
import Link from "next/link"

interface FormRendererProps {
  form: FormWithQuestions
  onSubmit: (responses: Record<string, any>) => void
}

export function FormRenderer({ form, onSubmit }: FormRendererProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const db = DatabaseService.getInstance()

  const updateResponse = (codigo: string, value: any) => {
    setResponses((prev) => ({ ...prev, [codigo]: value }))
    // Clear error when user starts typing
    if (errors[codigo]) {
      setErrors((prev) => ({ ...prev, [codigo]: "" }))
    }
  }

  const shouldShowQuestion = (pergunta: PerguntaWithOptions): boolean => {
    if (pergunta.condicionalidades.length === 0) {
      return true
    }

    // Verificar se alguma das condicionalidades foi atendida
    return pergunta.condicionalidades.some((condicionalidade) => {
      // Encontrar a opção de resposta
      const opcaoResposta = form.perguntas
        .flatMap((p) => p.opcoes)
        .find((opcao) => opcao.id === condicionalidade.id_opcao_resposta)

      if (!opcaoResposta) return false

      // Encontrar a pergunta que contém essa opção
      const perguntaOrigem = form.perguntas.find((p) => p.id === opcaoResposta.id_pergunta)
      if (!perguntaOrigem) return false

      // Verificar se a resposta corresponde à opção
      const response = responses[perguntaOrigem.codigo]

      if (perguntaOrigem.tipo_pergunta === "multipla_escolha") {
        return Array.isArray(response) && response.includes(opcaoResposta.resposta)
      } else {
        return response === opcaoResposta.resposta
      }
    })
  }

  const validateForm = (): boolean => {
    // Usar validação do DatabaseService
    const validation = db.validateFormResponses(form.id, responses)
    setErrors(validation.errors)
    return validation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (validateForm()) {
        onSubmit(responses)
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      setErrors({ submit: "Erro ao enviar formulário. Tente novamente." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const visibleQuestions = form.perguntas.sort((a, b) => a.ordem - b.ordem).filter(shouldShowQuestion)

  const answeredQuestions = visibleQuestions.filter((q) => {
    const response = responses[q.codigo]
    return response && (!Array.isArray(response) || response.length > 0)
  }).length

  const progress = visibleQuestions.length > 0 ? (answeredQuestions / visibleQuestions.length) * 100 : 0

  const renderQuestion = (pergunta: PerguntaWithOptions, questionIndex: number) => {
    const value = responses[pergunta.codigo]
    const error = errors[pergunta.codigo]

    return (
      <Card key={pergunta.id} className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Question Header */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {pergunta.titulo}
                {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {pergunta.orientacao_resposta && <p className="text-sm text-gray-600">{pergunta.orientacao_resposta}</p>}
            </div>

            {/* Question Input */}
            <div>
              {pergunta.tipo_pergunta === "texto_livre" && (
                <Textarea
                  value={value || ""}
                  onChange={(e) => updateResponse(pergunta.codigo, e.target.value)}
                  placeholder="Sua resposta"
                  rows={3}
                  className={`w-full ${error ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}`}
                />
              )}

              {pergunta.tipo_pergunta === "Inteiro" && (
                <Input
                  type="number"
                  value={value || ""}
                  onChange={(e) => {
                    const numValue = e.target.value ? Number.parseInt(e.target.value) : ""
                    updateResponse(pergunta.codigo, numValue)
                  }}
                  placeholder="Sua resposta"
                  className={error ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}
                />
              )}

              {pergunta.tipo_pergunta === "Numero_duas_casas_decimais" && (
                <Input
                  type="number"
                  step="0.01"
                  value={value || ""}
                  onChange={(e) => {
                    const numValue = e.target.value ? Number.parseFloat(e.target.value) : ""
                    updateResponse(pergunta.codigo, numValue)
                  }}
                  placeholder="Sua resposta"
                  className={error ? "border-red-500 focus:border-red-500" : "focus:border-purple-500"}
                />
              )}

              {pergunta.tipo_pergunta === "Sim_Nao" && (
                <RadioGroup
                  value={value || ""}
                  onValueChange={(selectedValue) => updateResponse(pergunta.codigo, selectedValue)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Sim" id={`${pergunta.id}-sim`} className="text-purple-600" />
                    <Label htmlFor={`${pergunta.id}-sim`} className="text-base">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="Não" id={`${pergunta.id}-nao`} className="text-purple-600" />
                    <Label htmlFor={`${pergunta.id}-nao`} className="text-base">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {pergunta.tipo_pergunta === "unica_escolha" && (
                <RadioGroup
                  value={value || ""}
                  onValueChange={(selectedValue) => updateResponse(pergunta.codigo, selectedValue)}
                  className="space-y-3"
                >
                  {pergunta.opcoes
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((opcao) => (
                      <div key={opcao.id} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={opcao.resposta}
                          id={`${pergunta.id}-${opcao.id}`}
                          className="text-purple-600"
                        />
                        <Label htmlFor={`${pergunta.id}-${opcao.id}`} className="text-base">
                          {opcao.resposta}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              )}

              {pergunta.tipo_pergunta === "multipla_escolha" && (
                <div className="space-y-3">
                  {pergunta.opcoes
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((opcao) => (
                      <div key={opcao.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${pergunta.id}-${opcao.id}`}
                          checked={(value || []).includes(opcao.resposta)}
                          onCheckedChange={(checked) => {
                            const currentValues = value || []
                            if (checked) {
                              updateResponse(pergunta.codigo, [...currentValues, opcao.resposta])
                            } else {
                              updateResponse(
                                pergunta.codigo,
                                currentValues.filter((v: string) => v !== opcao.resposta),
                              )
                            }
                          }}
                          className="text-purple-600"
                        />
                        <Label htmlFor={`${pergunta.id}-${opcao.id}`} className="text-base">
                          {opcao.resposta}
                        </Label>
                      </div>
                    ))}
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-t-8 border-t-purple-600">
        <CardContent className="p-6">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar aos formulários
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.titulo}</h1>
          {form.descricao && <p className="text-gray-600 mb-4">{form.descricao}</p>}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso</span>
              <span>
                {answeredQuestions} de {visibleQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Exibir erros gerais */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {visibleQuestions.map((pergunta, index) => renderQuestion(pergunta, index))}

        {/* Submit Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {visibleQuestions.filter((q) => q.obrigatoria).length} perguntas obrigatórias
              </p>
              <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700" size="lg">
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
