import { z } from "zod"

// Schema para Formulário
export const FormularioSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  titulo: z.string().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  descricao: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
  ordem: z.number().int().positive("Ordem deve ser um número positivo"),
  createdAt: z.string(),
  responseCount: z.number().int().min(0).optional(),
})

// Schema para tipos de pergunta
export const TipoPerguntaSchema = z.enum([
  "Sim_Nao",
  "multipla_escolha",
  "unica_escolha",
  "texto_livre",
  "Inteiro",
  "Numero_duas_casas_decimais",
])

// Schema para Pergunta
export const PerguntaSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  id_formulario: z.string().min(1, "ID do formulário é obrigatório"),
  titulo: z.string().min(1, "Título da pergunta é obrigatório").max(300, "Título deve ter no máximo 300 caracteres"),
  codigo: z.string().min(1, "Código é obrigatório").max(100, "Código deve ter no máximo 100 caracteres"),
  orientacao_resposta: z.string().max(500, "Orientação deve ter no máximo 500 caracteres").optional(),
  ordem: z.number().int().positive("Ordem deve ser um número positivo"),
  obrigatoria: z.boolean(),
  sub_pergunta: z.boolean(),
  tipo_pergunta: TipoPerguntaSchema,
})

// Schema para Opção de Resposta
export const OpcaoRespostaSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  id_pergunta: z.string().min(1, "ID da pergunta é obrigatório"),
  resposta: z.string().min(1, "Resposta é obrigatória").max(200, "Resposta deve ter no máximo 200 caracteres"),
  ordem: z.number().int().positive("Ordem deve ser um número positivo"),
  resposta_aberta: z.boolean(),
})

// Schema para Condicionalidade
export const OpcaoRespostaPerguntaSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  id_opcao_resposta: z.string().min(1, "ID da opção de resposta é obrigatório"),
  id_pergunta: z.string().min(1, "ID da pergunta é obrigatório"),
})

// Schema para Resposta do Formulário
export const FormResponseSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  formId: z.string().min(1, "ID do formulário é obrigatório"),
  responses: z.record(z.any()),
  submittedAt: z.string(),
})

// Schema para validação de respostas baseado no tipo de pergunta
export const createResponseValidationSchema = (pergunta: z.infer<typeof PerguntaSchema>) => {
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

// Schema para validação completa de um formulário com perguntas
export const FormWithQuestionsSchema = FormularioSchema.extend({
  perguntas: z.array(
    PerguntaSchema.extend({
      opcoes: z.array(OpcaoRespostaSchema),
      condicionalidades: z.array(OpcaoRespostaPerguntaSchema),
    }),
  ),
})

// Tipos inferidos dos schemas
export type FormularioValidated = z.infer<typeof FormularioSchema>
export type PerguntaValidated = z.infer<typeof PerguntaSchema>
export type OpcaoRespostaValidated = z.infer<typeof OpcaoRespostaSchema>
export type OpcaoRespostaPerguntaValidated = z.infer<typeof OpcaoRespostaPerguntaSchema>
export type FormResponseValidated = z.infer<typeof FormResponseSchema>
export type FormWithQuestionsValidated = z.infer<typeof FormWithQuestionsSchema>
