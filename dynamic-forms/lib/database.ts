"use client"

import type {
  Formulario,
  Pergunta,
  OpcaoResposta,
  OpcaoRespostaPergunta,
  FormWithQuestions,
  PerguntaWithOptions,
  FormResponse,
} from "@/types/database"
import {
  FormularioSchema,
  PerguntaSchema,
  OpcaoRespostaSchema,
  OpcaoRespostaPerguntaSchema,
  FormResponseSchema,
  FormWithQuestionsSchema,
} from "./validations"
import { z } from "zod"

// Simulação de banco de dados usando localStorage com validação Zod
export class DatabaseService {
  private static instance: DatabaseService

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Método auxiliar para validar dados
  private validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Erro de validação:", error.errors)
        throw new Error(`Dados inválidos: ${error.errors.map((e) => e.message).join(", ")}`)
      }
      throw error
    }
  }

  // FORMULÁRIOS
  getFormularios(): Formulario[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("formularios")
    const rawData = data ? JSON.parse(data) : []

    // Validar cada formulário
    return rawData
      .map((item: unknown) => {
        try {
          return this.validateData(FormularioSchema, item)
        } catch (error) {
          console.warn("Formulário inválido encontrado, removendo:", error)
          return null
        }
      })
      .filter(Boolean)
  }

  saveFormulario(formulario: Formulario): void {
    if (typeof window === "undefined") return
    // Validar antes de salvar
    const validatedFormulario = this.validateData(FormularioSchema, formulario)

    const formularios = this.getFormularios()
    const index = formularios.findIndex((f) => f.id === validatedFormulario.id)

    if (index >= 0) {
      formularios[index] = validatedFormulario
    } else {
      formularios.push(validatedFormulario)
    }

    localStorage.setItem("formularios", JSON.stringify(formularios))
  }

  deleteFormulario(id: string): void {
    if (typeof window === "undefined") return
    if (!id || typeof id !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    const formularios = this.getFormularios().filter((f) => f.id !== id)
    localStorage.setItem("formularios", JSON.stringify(formularios))

    // Limpar dados relacionados
    this.deletePerguntas(id)
    this.deleteFormResponses(id)
  }

  getFormulario(id: string): Formulario | null {
    if (!id || typeof id !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    const formularios = this.getFormularios()
    return formularios.find((f) => f.id === id) || null
  }

  // PERGUNTAS
  getPerguntas(formularioId?: string): Pergunta[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("perguntas")
    const rawData: unknown[] = data ? JSON.parse(data) : []

    // Validar cada pergunta
    const validatedPerguntas = rawData
      .map((item: unknown) => {
        try {
          return this.validateData(PerguntaSchema, item)
        } catch (error) {
          console.warn("Pergunta inválida encontrada, removendo:", error)
          return null
        }
      })
      .filter(Boolean)

    if (formularioId) {
      return validatedPerguntas.filter((p) => p.id_formulario === formularioId)
    }

    return validatedPerguntas
  }

  savePergunta(pergunta: Pergunta): void {
    if (typeof window === "undefined") return
    // Validar antes de salvar
    const validatedPergunta = this.validateData(PerguntaSchema, pergunta)

    const perguntas = this.getPerguntas()
    const index = perguntas.findIndex((p) => p.id === validatedPergunta.id)

    if (index >= 0) {
      perguntas[index] = validatedPergunta
    } else {
      perguntas.push(validatedPergunta)
    }

    localStorage.setItem("perguntas", JSON.stringify(perguntas))
  }

  deletePergunta(id: string): void {
    if (typeof window === "undefined") return
    if (!id || typeof id !== "string") {
      throw new Error("ID da pergunta deve ser uma string válida")
    }

    const perguntas = this.getPerguntas().filter((p) => p.id !== id)
    localStorage.setItem("perguntas", JSON.stringify(perguntas))

    // Limpar opções relacionadas
    this.deleteOpcoesByPergunta(id)
  }

  deletePerguntas(formularioId: string): void {
    if (typeof window === "undefined") return
    if (!formularioId || typeof formularioId !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    const perguntas = this.getPerguntas().filter((p) => p.id_formulario !== formularioId)
    localStorage.setItem("perguntas", JSON.stringify(perguntas))
  }

  // OPÇÕES DE RESPOSTA
  getOpcoes(perguntaId?: string): OpcaoResposta[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("opcoes_respostas")
    const rawData: unknown[] = data ? JSON.parse(data) : []

    // Validar cada opção
    const validatedOpcoes = rawData
      .map((item: unknown) => {
        try {
          return this.validateData(OpcaoRespostaSchema, item)
        } catch (error) {
          console.warn("Opção inválida encontrada, removendo:", error)
          return null
        }
      })
      .filter(Boolean)

    if (perguntaId) {
      return validatedOpcoes.filter((o) => o.id_pergunta === perguntaId)
    }

    return validatedOpcoes
  }

  saveOpcao(opcao: OpcaoResposta): void {
    if (typeof window === "undefined") return
    // Validar antes de salvar
    const validatedOpcao = this.validateData(OpcaoRespostaSchema, opcao)

    const opcoes = this.getOpcoes()
    const index = opcoes.findIndex((o) => o.id === validatedOpcao.id)

    if (index >= 0) {
      opcoes[index] = validatedOpcao
    } else {
      opcoes.push(validatedOpcao)
    }

    localStorage.setItem("opcoes_respostas", JSON.stringify(opcoes))
  }

  deleteOpcao(id: string): void {
    if (typeof window === "undefined") return
    if (!id || typeof id !== "string") {
      throw new Error("ID da opção deve ser uma string válida")
    }

    const opcoes = this.getOpcoes().filter((o) => o.id !== id)
    localStorage.setItem("opcoes_respostas", JSON.stringify(opcoes))
  }

  deleteOpcoesByPergunta(perguntaId: string): void {
    if (typeof window === "undefined") return
    if (!perguntaId || typeof perguntaId !== "string") {
      throw new Error("ID da pergunta deve ser uma string válida")
    }

    const opcoes = this.getOpcoes().filter((o) => o.id_pergunta !== perguntaId)
    localStorage.setItem("opcoes_respostas", JSON.stringify(opcoes))
  }

  // CONDICIONALIDADES (OPCOES_RESPOSTA_PERGUNTA)
  getCondicionalidades(): OpcaoRespostaPergunta[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("opcoes_resposta_pergunta")
    const rawData: unknown[] = data ? JSON.parse(data) : []

    // Validar cada condicionalidade
    return rawData
      .map((item: unknown) => {
        try {
          return this.validateData(OpcaoRespostaPerguntaSchema, item)
        } catch (error) {
          console.warn("Condicionalidade inválida encontrada, removendo:", error)
          return null
        }
      })
      .filter(Boolean)
  }

  saveCondicionalidade(condicionalidade: OpcaoRespostaPergunta): void {
    if (typeof window === "undefined") return
    // Validar antes de salvar
    const validatedCondicionalidade = this.validateData(OpcaoRespostaPerguntaSchema, condicionalidade)

    const condicionalidades = this.getCondicionalidades()
    const index = condicionalidades.findIndex((c) => c.id === validatedCondicionalidade.id)

    if (index >= 0) {
      condicionalidades[index] = validatedCondicionalidade
    } else {
      condicionalidades.push(validatedCondicionalidade)
    }

    localStorage.setItem("opcoes_resposta_pergunta", JSON.stringify(condicionalidades))
  }

  deleteCondicionalidade(id: string): void {
    if (typeof window === "undefined") return
    if (!id || typeof id !== "string") {
      throw new Error("ID da condicionalidade deve ser uma string válida")
    }

    const condicionalidades = this.getCondicionalidades().filter((c) => c.id !== id)
    localStorage.setItem("opcoes_resposta_pergunta", JSON.stringify(condicionalidades))
  }

  getCondicionalidadesByPergunta(perguntaId: string): OpcaoRespostaPergunta[] {
    if (!perguntaId || typeof perguntaId !== "string") {
      throw new Error("ID da pergunta deve ser uma string válida")
    }

    return this.getCondicionalidades().filter((c) => c.id_pergunta === perguntaId)
  }

  // MÉTODOS COMPOSTOS
  getFormWithQuestions(formularioId: string): FormWithQuestions | null {
    if (!formularioId || typeof formularioId !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    const formulario = this.getFormulario(formularioId)
    if (!formulario) return null

    const perguntas = this.getPerguntas(formularioId)
      .sort((a, b) => a.ordem - b.ordem)
      .map((pergunta) => {
        const opcoes = this.getOpcoes(pergunta.id).sort((a, b) => a.ordem - b.ordem)
        const condicionalidades = this.getCondicionalidadesByPergunta(pergunta.id)

        return {
          ...pergunta,
          opcoes,
          condicionalidades,
        } as PerguntaWithOptions
      })

    const formWithQuestions = {
      ...formulario,
      perguntas,
    }

    // Validar o formulário completo
    try {
      return this.validateData(FormWithQuestionsSchema, formWithQuestions)
    } catch (error) {
      console.error("Erro ao validar formulário completo:", error)
      throw new Error("Formulário contém dados inválidos")
    }
  }

  // RESPOSTAS
  getFormResponses(formId: string): FormResponse[] {
    if (typeof window === "undefined") return []
    if (!formId || typeof formId !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    const data = localStorage.getItem(`responses_${formId}`)
    const rawData: unknown[] = data ? JSON.parse(data) : []

    // Validar cada resposta
    return rawData
      .map((item: unknown) => {
        try {
          return this.validateData(FormResponseSchema, item)
        } catch (error) {
          console.warn("Resposta inválida encontrada, removendo:", error)
          return null
        }
      })
      .filter(Boolean)
  }

  saveFormResponse(response: FormResponse): void {
    if (typeof window === "undefined") return
    // Validar antes de salvar
    const validatedResponse = this.validateData(FormResponseSchema, response)

    const responses = this.getFormResponses(validatedResponse.formId)
    responses.push(validatedResponse)
    localStorage.setItem(`responses_${validatedResponse.formId}`, JSON.stringify(responses))

    // Atualizar contador de respostas
    const formulario = this.getFormulario(validatedResponse.formId)
    if (formulario) {
      formulario.responseCount = responses.length
      this.saveFormulario(formulario)
    }
  }

  deleteFormResponses(formId: string): void {
    if (typeof window === "undefined") return
    if (!formId || typeof formId !== "string") {
      throw new Error("ID do formulário deve ser uma string válida")
    }

    localStorage.removeItem(`responses_${formId}`)
  }

  // UTILITÁRIOS
  generateId(): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)

    // Validar que o ID gerado é válido
    if (!id || typeof id !== "string" || id.length < 1) {
      throw new Error("Falha ao gerar ID válido")
    }

    return id
  }

  generateCodigo(titulo: string): string {
    if (!titulo || typeof titulo !== "string") {
      throw new Error("Título deve ser uma string válida para gerar código")
    }

    const codigo = titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")

    // Garantir que o código não está vazio
    return codigo || "pergunta_sem_titulo"
  }

  // Método para validar respostas de formulário
  validateFormResponses(
    formId: string,
    responses: Record<string, any>,
  ): { isValid: boolean; errors: Record<string, string> } {
    const form = this.getFormWithQuestions(formId)
    if (!form) {
      return { isValid: false, errors: { form: "Formulário não encontrado" } }
    }

    const errors: Record<string, string> = {}

    form.perguntas.forEach((pergunta) => {
      const response = responses[pergunta.codigo]

      // Verificar se a pergunta é obrigatória
      if (pergunta.obrigatoria) {
        if (!response || (Array.isArray(response) && response.length === 0)) {
          errors[pergunta.codigo] = "Esta pergunta é obrigatória"
          return
        }
      }

      // Validar tipo de resposta se houver resposta
      if (response !== undefined && response !== null && response !== "") {
        try {
          const schema = this.createResponseValidationSchema(pergunta)
          schema.parse(response)
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors[pergunta.codigo] = error.errors[0]?.message || "Resposta inválida"
          }
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  private createResponseValidationSchema(pergunta: Pergunta) {
    switch (pergunta.tipo_pergunta) {
      case "texto_livre":
        return z.string().min(1, "Resposta é obrigatória")

      case "Sim_Nao":
        return z.enum(["Sim", "Não"], {
          errorMap: () => ({ message: "Selecione Sim ou Não" }),
        })

      case "unica_escolha":
        return z.string().min(1, "Selecione uma opção")

      case "multipla_escolha":
        return z.array(z.string()).min(1, "Selecione pelo menos uma opção")

      case "Inteiro":
        return z.number().int("Deve ser um número inteiro")

      case "Numero_duas_casas_decimais":
        return z.number().multipleOf(0.01, "Deve ter no máximo 2 casas decimais")

      default:
        return z.any()
    }
  }
}
