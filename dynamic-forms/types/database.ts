// Tipos baseados na estrutura do banco de dados fornecida

export interface Formulario {
  id: string
  titulo: string
  descricao: string
  ordem: number
  createdAt: string
  responseCount?: number
}

export type TipoPergunta =
  | "Sim_Nao"
  | "multipla_escolha"
  | "unica_escolha"
  | "texto_livre"
  | "Inteiro"
  | "Numero_duas_casas_decimais"

export interface Pergunta {
  id: string
  id_formulario: string
  titulo: string
  codigo: string
  orientacao_resposta?: string
  ordem: number
  obrigatoria: boolean
  sub_pergunta: boolean
  tipo_pergunta: TipoPergunta
}

export interface OpcaoResposta {
  id: string
  id_pergunta: string
  resposta: string
  ordem: number
  resposta_aberta: boolean
}

export interface OpcaoRespostaPergunta {
  id: string
  id_opcao_resposta: string
  id_pergunta: string
}

export interface FormResponse {
  id: string
  formId: string
  responses: Record<string, any>
  submittedAt: string
}

// Tipos para a interface
export interface FormWithQuestions extends Formulario {
  perguntas: PerguntaWithOptions[]
}

export interface PerguntaWithOptions extends Pergunta {
  opcoes: OpcaoResposta[]
  condicionalidades: OpcaoRespostaPergunta[]
}
