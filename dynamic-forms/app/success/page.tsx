"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resposta enviada</h1>
          <p className="text-gray-600 mb-6">
            Obrigado por responder ao formulário. Sua resposta foi registrada com sucesso.
          </p>
          <Link href="/">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Criar outro formulário</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
