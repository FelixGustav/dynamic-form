"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuestionEditor } from "./question-editor"
import { Plus, Eye, Send, Palette, AlertCircle } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import type { Formulario, PerguntaWithOptions, FormWithQuestions } from "@/types/database"
import { FormularioSchema } from "@/lib/validations"
import { z } from "zod"
import { Label } from "@/components/ui/label"

interface FormBuilderProps {
  initialData?: FormWithQuestions
  onSave: () => void
}

export function FormBuilder({ initialData, onSave }: FormBuilderProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo || "")
  const [descricao, setDescricao] = useState(initialData?.descricao || "")
  const [ordem, setOrdem] = useState(initialData?.ordem || 1)
  const [perguntas, setPerguntas] = useState<PerguntaWithOptions[]>(initialData?.perguntas || [])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  const db = DatabaseService.getInstance()

  const validateForm = (): boolean => {
    setIsValidating(true)
    const newErrors: Record<string, string> = {}

    // Validar dados do formulário
    try {
      FormularioSchema.parse({
        id: initialData?.id || "temp",
        titulo,
        descricao,
        ordem,
        createdAt: new Date().toISOString(),
        responseCount: 0,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
      }
    }

    // Validar perguntas
    if (perguntas.length === 0) {
      newErrors.perguntas = "Adicione pelo menos uma pergunta ao formulário"
    }

    perguntas.forEach((pergunta, index) => {
      if (!pergunta.titulo.trim()) {
        newErrors[`pergunta_${index}_titulo`] = `Pergunta ${index + 1}: Título é obrigatório`
      }

      // Validar opções para perguntas de múltipla escolha
      if (["multipla_escolha", "unica_escolha"].includes(pergunta.tipo_pergunta)) {
        if (pergunta.opcoes.length === 0) {
          newErrors[`pergunta_${index}_opcoes`] = `Pergunta ${index + 1}: Adicione pelo menos uma opção`
        }

        pergunta.opcoes.forEach((opcao, opcaoIndex) => {
          if (!opcao.resposta.trim()) {
            newErrors[`pergunta_${index}_opcao_${opcaoIndex}`] =
              `Pergunta ${index + 1}, Opção ${opcaoIndex + 1}: Texto é obrigatório`
          }
        })
      }
    })

    setErrors(newErrors)
    setIsValidating(false)
    return Object.keys(newErrors).length === 0
  }

  const addPergunta = () => {
    const newPergunta: PerguntaWithOptions = {
      id: db.generateId(),
      id_formulario: initialData?.id || "",
      titulo: "",
      codigo: "",
      orientacao_resposta: "",
      ordem: perguntas.length + 1,
      obrigatoria: false,
      sub_pergunta: false,
      tipo_pergunta: "texto_livre",
      opcoes: [],
      condicionalidades: [],
    }
    setPerguntas([...perguntas, newPergunta])
  }

  const updatePergunta = (id: string, updatedPergunta: PerguntaWithOptions) => {
    setPerguntas(perguntas.map((p) => (p.id === id ? updatedPergunta : p)))

    // Limpar erros relacionados a esta pergunta
    const newErrors = { ...errors }
    Object.keys(newErrors).forEach((key) => {
      if (key.includes(id)) {
        delete newErrors[key]
      }
    })
    setErrors(newErrors)
  }

  const deletePergunta = (id: string) => {
    setPerguntas(perguntas.filter((p) => p.id !== id))

    // Limpar erros relacionados a esta pergunta
    const newErrors = { ...errors }
    Object.keys(newErrors).forEach((key) => {
      if (key.includes(id)) {
        delete newErrors[key]
      }
    })
    setErrors(newErrors)
  }

  const movePergunta = (id: string, direction: "up" | "down") => {
    const index = perguntas.findIndex((p) => p.id === id)
    if (index === -1) return

    const newPerguntas = [...perguntas]
    if (direction === "up" && index > 0) {
      ;[newPerguntas[index], newPerguntas[index - 1]] = [newPerguntas[index - 1], newPerguntas[index]]
    } else if (direction === "down" && index < perguntas.length - 1) {
      ;[newPerguntas[index], newPerguntas[index + 1]] = [newPerguntas[index + 1], newPerguntas[index]]
    }

    // Reordenar
    newPerguntas.forEach((pergunta, idx) => {
      pergunta.ordem = idx + 1
    })

    setPerguntas(newPerguntas)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Salvar formulário
      const formulario: Formulario = {
        id: initialData?.id || db.generateId(),
        titulo,
        descricao,
        ordem,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        responseCount: initialData?.responseCount || 0,
      }

      db.saveFormulario(formulario)

      // Salvar perguntas e suas opções
      perguntas.forEach((pergunta) => {
        // Gerar código se não existir
        if (!pergunta.codigo) {
          pergunta.codigo = db.generateCodigo(pergunta.titulo)
        }

        pergunta.id_formulario = formulario.id

        // Salvar pergunta
        db.savePergunta({
          id: pergunta.id,
          id_formulario: pergunta.id_formulario,
          titulo: pergunta.titulo,
          codigo: pergunta.codigo,
          orientacao_resposta: pergunta.orientacao_resposta,
          ordem: pergunta.ordem,
          obrigatoria: pergunta.obrigatoria,
          sub_pergunta: pergunta.sub_pergunta,
          tipo_pergunta: pergunta.tipo_pergunta,
        })

        // Salvar opções
        pergunta.opcoes.forEach((opcao) => {
          opcao.id_pergunta = pergunta.id
          db.saveOpcao(opcao)
        })

        // Salvar condicionalidades
        pergunta.condicionalidades.forEach((cond) => {
          db.saveCondicionalidade(cond)
        })
      })

      onSave()
    } catch (error) {
      console.error("Erro ao salvar formulário:", error)
      setErrors({ save: "Erro ao salvar formulário. Verifique os dados e tente novamente." })
    }
  }

  // Limpar erros quando campos são alterados
  const handleTituloChange = (value: string) => {
    setTitulo(value)
    if (errors.titulo) {
      const newErrors = { ...errors }
      delete newErrors.titulo
      setErrors(newErrors)
    }
  }

  const handleDescricaoChange = (value: string) => {
    setDescricao(value)
    if (errors.descricao) {
      const newErrors = { ...errors }
      delete newErrors.descricao
      setErrors(newErrors)
    }
  }

  return (
    <div className="space-y-6">
      {/* Exibir erros gerais */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {Object.entries(errors).map(([key, message]) => (
                <div key={key}>{message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Header */}
      <Card className="border-t-8 border-t-purple-600">
        <CardContent className="p-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Configuração do Formulário</h2>
                <p className="text-purple-100">Crie formulários incríveis com facilidade</p>
              </div>
            </div>

            <div>
              <Label htmlFor="form-title" className="text-sm font-medium text-purple-100 mb-3 block">
                Título do formulário *
              </Label>
              <Input
                id="form-title"
                value={titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                placeholder="Ex: Pesquisa de Satisfação do Cliente"
                className={`text-xl font-medium bg-white/10 backdrop-blur-sm border-2 ${
                  errors.titulo ? "border-red-400 focus:border-red-300" : "border-white/30 focus:border-white/50"
                } rounded-xl px-4 py-4 text-white placeholder:text-purple-200 focus:ring-2 focus:ring-white/20 transition-all duration-300`}
              />
              {errors.titulo && (
                <p className="text-red-200 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.titulo}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="form-description" className="text-sm font-medium text-purple-100 mb-3 block">
                Descrição (opcional)
              </Label>
              <Textarea
                id="form-description"
                value={descricao}
                onChange={(e) => handleDescricaoChange(e.target.value)}
                placeholder="Descreva o objetivo do seu formulário..."
                className={`bg-white/10 backdrop-blur-sm border-2 ${
                  errors.descricao ? "border-red-400 focus:border-red-300" : "border-white/30 focus:border-white/50"
                } rounded-xl px-4 py-3 text-white placeholder:text-purple-200 resize-none focus:ring-2 focus:ring-white/20 transition-all duration-300`}
                rows={3}
              />
              {errors.descricao && (
                <p className="text-red-200 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.descricao}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center space-x-2 text-sm text-purple-100">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Rascunho salvo automaticamente</span>
              </div>
              <div className="text-sm text-purple-200 bg-white/10 px-3 py-1 rounded-full">
                {perguntas.length} pergunta{perguntas.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {perguntas.map((pergunta, index) => (
        <QuestionEditor
          key={pergunta.id}
          pergunta={pergunta}
          index={index}
          perguntas={perguntas}
          onUpdate={updatePergunta}
          onDelete={deletePergunta}
          onMove={movePergunta}
          errors={errors}
        />
      ))}

      {/* Add Question Button */}
      <Card className="border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group">
        <CardContent className="p-8">
          <Button
            onClick={addPergunta}
            variant="ghost"
            className="w-full h-16 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-xl transition-all duration-300 group-hover:scale-105"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors duration-300">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-medium">Adicionar pergunta</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      {errors.perguntas && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.perguntas}</AlertDescription>
        </Alert>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-xl border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
        >
          <Palette className="h-4 w-4 mr-2 text-purple-600" />
          <span className="text-purple-700">Personalizar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
        >
          <Eye className="h-4 w-4 mr-2 text-indigo-600" />
          <span className="text-indigo-700">Visualizar</span>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isValidating}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          <Send className="h-4 w-4 mr-2" />
          {isValidating ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}
