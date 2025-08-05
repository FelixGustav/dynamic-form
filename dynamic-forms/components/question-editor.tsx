"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MoreVertical,
  Copy,
  Trash2,
  Plus,
  X,
  GripVertical,
  Type,
  CheckSquare,
  Circle,
  Hash,
  ToggleLeft,
  AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { PerguntaWithOptions, TipoPergunta, OpcaoResposta } from "@/types/database"
import { DatabaseService } from "@/lib/database"

interface QuestionEditorProps {
  pergunta: PerguntaWithOptions
  index: number
  perguntas: PerguntaWithOptions[]
  onUpdate: (id: string, pergunta: PerguntaWithOptions) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: "up" | "down") => void
  errors: Record<string, string>
}

const questionTypeIcons = {
  texto_livre: Type,
  Sim_Nao: ToggleLeft,
  multipla_escolha: CheckSquare,
  unica_escolha: Circle,
  Inteiro: Hash,
  Numero_duas_casas_decimais: Hash,
}

const questionTypeLabels = {
  texto_livre: "Resposta curta",
  Sim_Nao: "Sim/Não",
  multipla_escolha: "Múltipla escolha",
  unica_escolha: "Escolha única",
  Inteiro: "Número inteiro",
  Numero_duas_casas_decimais: "Número decimal",
}

export function QuestionEditor({
  pergunta,
  index,
  perguntas,
  onUpdate,
  onDelete,
  onMove,
  errors,
}: QuestionEditorProps) {
  const [isEditing, setIsEditing] = useState(!pergunta.titulo)
  const [showCondicionalidades, setShowCondicionalidades] = useState(false)
  const db = DatabaseService.getInstance()

  const updateField = (field: string, value: any) => {
    const updated = { ...pergunta, [field]: value }

    // Auto-gerar código quando o título muda
    if (field === "titulo" && value) {
      updated.codigo = db.generateCodigo(value)
    }

    onUpdate(pergunta.id, updated)
  }

  const addOpcao = () => {
    const newOpcao: OpcaoResposta = {
      id: db.generateId(),
      id_pergunta: pergunta.id,
      resposta: `Opção ${pergunta.opcoes.length + 1}`,
      ordem: pergunta.opcoes.length + 1,
      resposta_aberta: false,
    }

    const updatedPergunta = {
      ...pergunta,
      opcoes: [...pergunta.opcoes, newOpcao],
    }
    onUpdate(pergunta.id, updatedPergunta)
  }

  const updateOpcao = (opcaoId: string, field: string, value: any) => {
    const updatedOpcoes = pergunta.opcoes.map((opcao) => (opcao.id === opcaoId ? { ...opcao, [field]: value } : opcao))

    const updatedPergunta = {
      ...pergunta,
      opcoes: updatedOpcoes,
    }
    onUpdate(pergunta.id, updatedPergunta)
  }

  const removeOpcao = (opcaoId: string) => {
    const updatedOpcoes = pergunta.opcoes.filter((opcao) => opcao.id !== opcaoId)

    const updatedPergunta = {
      ...pergunta,
      opcoes: updatedOpcoes,
    }
    onUpdate(pergunta.id, updatedPergunta)
  }

  const needsOptions = ["multipla_escolha", "unica_escolha"].includes(pergunta.tipo_pergunta)
  const IconComponent = questionTypeIcons[pergunta.tipo_pergunta]

  // Filtrar erros relacionados a esta pergunta
  const questionErrors = Object.entries(errors).filter(
    ([key]) => key.includes(`pergunta_${index}`) || key.includes(pergunta.id),
  )

  const renderPreview = () => {
    switch (pergunta.tipo_pergunta) {
      case "texto_livre":
        return <Input placeholder="Resposta curta" disabled className="mt-3" />

      case "Sim_Nao":
        return (
          <RadioGroup className="mt-3" disabled>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" disabled />
              <Label>Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" disabled />
              <Label>Não</Label>
            </div>
          </RadioGroup>
        )

      case "unica_escolha":
        return (
          <RadioGroup className="mt-3" disabled>
            {pergunta.opcoes.map((opcao) => (
              <div key={opcao.id} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao.resposta} disabled />
                <Label>{opcao.resposta}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "multipla_escolha":
        return (
          <div className="mt-3 space-y-2">
            {pergunta.opcoes.map((opcao) => (
              <div key={opcao.id} className="flex items-center space-x-2">
                <Checkbox disabled />
                <Label>{opcao.resposta}</Label>
              </div>
            ))}
          </div>
        )

      case "Inteiro":
      case "Numero_duas_casas_decimais":
        return <Input type="number" placeholder="Sua resposta" disabled className="mt-3" />

      default:
        return null
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Exibir erros da pergunta */}
        {questionErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {questionErrors.map(([key, message]) => (
                  <div key={key}>{message}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-start space-x-4">
          {/* Drag Handle */}
          <div className="flex flex-col items-center space-y-2 pt-2">
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-medium text-purple-600">{index + 1}</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {/* Question Input */}
            <div className="flex items-center space-x-3">
              <Input
                value={pergunta.titulo}
                onChange={(e) => updateField("titulo", e.target.value)}
                placeholder="Pergunta"
                className={`text-lg border-0 border-b-2 ${
                  errors[`pergunta_${index}_titulo`] ? "border-red-500" : "border-gray-200 focus:border-purple-600"
                } rounded-none px-0 focus:ring-0`}
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
              />
              <div className="flex items-center space-x-2">
                <IconComponent className="h-5 w-5 text-gray-400" />
                <Select
                  value={pergunta.tipo_pergunta}
                  onValueChange={(value: TipoPergunta) => updateField("tipo_pergunta", value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Question Description */}
            {pergunta.orientacao_resposta !== undefined && (
              <Textarea
                value={pergunta.orientacao_resposta || ""}
                onChange={(e) => updateField("orientacao_resposta", e.target.value)}
                placeholder="Descrição (opcional)"
                className="border-0 border-b border-gray-200 focus:border-purple-600 rounded-none px-0 resize-none focus:ring-0"
                rows={1}
              />
            )}

            {/* Options for multiple choice questions */}
            {needsOptions && (
              <div>
                <div className="space-y-2">
                  {pergunta.opcoes.map((opcao, opcaoIndex) => (
                    <div key={opcao.id} className="flex items-center space-x-3">
                      {pergunta.tipo_pergunta === "multipla_escolha" ? (
                        <Checkbox disabled />
                      ) : (
                        <RadioGroupItem value={opcao.resposta} disabled />
                      )}
                      <Input
                        value={opcao.resposta}
                        onChange={(e) => updateOpcao(opcao.id, "resposta", e.target.value)}
                        placeholder={`Opção ${opcaoIndex + 1}`}
                        className={`border-0 border-b ${
                          errors[`pergunta_${index}_opcao_${opcaoIndex}`]
                            ? "border-red-500"
                            : "border-gray-200 focus:border-purple-600"
                        } rounded-none px-0 focus:ring-0`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOpcao(opcao.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addOpcao}
                  className="text-purple-600 hover:text-purple-700 mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar opção
                </Button>

                {errors[`pergunta_${index}_opcoes`] && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors[`pergunta_${index}_opcoes`]}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Preview when not editing */}
            {!isEditing && !needsOptions && renderPreview()}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {}}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(pergunta.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${pergunta.id}`}
                checked={pergunta.obrigatoria}
                onCheckedChange={(checked) => updateField("obrigatoria", checked)}
              />
              <Label htmlFor={`required-${pergunta.id}`} className="text-sm">
                Obrigatória
              </Label>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCondicionalidades(!showCondicionalidades)}
              className="text-sm"
            >
              Condicionalidades
            </Button>
          </div>
        </div>

        {/* Conditional Logic */}
        {showCondicionalidades && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Esta pergunta será exibida apenas se:</p>
            {/* Implementar lógica condicional aqui */}
            <p className="text-xs text-gray-500">Funcionalidade de condicionalidades em desenvolvimento</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
