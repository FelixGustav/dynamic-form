"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Edit, BarChart3, Share2, Trash2, Copy, FileText } from "lucide-react"
import Link from "next/link"
import { DatabaseService } from "@/lib/database"
import type { Formulario } from "@/types/database"

export function FormList() {
  const [forms, setForms] = useState<Formulario[]>([])
  const db = DatabaseService.getInstance()

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = () => {
    const formularios = db.getFormularios()
    // Ordenar por data de criação (mais recente primeiro)
    const sortedForms = formularios.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setForms(sortedForms)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este formulário? Esta ação não pode ser desfeita.")) {
      db.deleteFormulario(id)
      loadForms()
    }
  }

  const handleDuplicate = (form: Formulario) => {
    const originalForm = db.getFormWithQuestions(form.id)
    if (!originalForm) return

    const newFormId = db.generateId()
    const duplicatedForm: Formulario = {
      ...form,
      id: newFormId,
      titulo: `${form.titulo} (Cópia)`,
      createdAt: new Date().toISOString(),
      responseCount: 0,
    }

    db.saveFormulario(duplicatedForm)

    // Duplicar perguntas
    originalForm.perguntas.forEach((pergunta) => {
      const newPerguntaId = db.generateId()
      const duplicatedPergunta = {
        ...pergunta,
        id: newPerguntaId,
        id_formulario: newFormId,
      }

      db.savePergunta(duplicatedPergunta)

      // Duplicar opções
      pergunta.opcoes.forEach((opcao) => {
        const duplicatedOpcao = {
          ...opcao,
          id: db.generateId(),
          id_pergunta: newPerguntaId,
        }
        db.saveOpcao(duplicatedOpcao)
      })
    })

    loadForms()
  }

  const copyFormLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(link)
    // Aqui você poderia adicionar um toast de sucesso
    alert("Link copiado para a área de transferência!")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum formulário criado ainda</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Comece criando seu primeiro formulário para coletar respostas e analisar dados.
        </p>
        <Link href="/create">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro formulário
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Formulários</h2>
          <p className="text-gray-600">Gerencie e analise seus formulários</p>
        </div>
        <Link href="/create">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo formulário
          </Button>
        </Link>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate">{form.titulo}</CardTitle>
                  {form.descricao && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{form.descricao}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/edit/${form.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyFormLink(form.id)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(form.id)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">{form.responseCount || 0} respostas</span>
                    <Badge variant="secondary" className="text-xs">
                      Ativo
                    </Badge>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500">Criado em {formatDate(form.createdAt)}</p>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link href={`/form/${form.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </Link>
                  <Link href={`/responses/${form.id}`}>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Respostas
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
