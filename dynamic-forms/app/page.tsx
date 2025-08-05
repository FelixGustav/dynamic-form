import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h1 className="text-xl font-medium text-gray-900">Dynamic Forms</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao Dynamic Forms</h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie formulários dinâmicos com lógica condicional de forma simples e intuitiva. Colete respostas, analise
            dados e tome decisões baseadas em informações precisas.
          </p>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Começar agora</h2>
              <p className="text-gray-600 mb-6">Crie seu primeiro formulário em poucos minutos</p>
              <Link 
                href="/create" 
                className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Criar Formulário
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">📝</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fácil de Usar</h3>
              <p className="text-gray-600">
                Interface intuitiva inspirada no Google Forms para criar formulários rapidamente
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">🔀</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lógica Condicional</h3>
              <p className="text-gray-600">Crie formulários inteligentes que se adaptam às respostas dos usuários</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de Dados</h3>
              <p className="text-gray-600">Visualize e exporte respostas para tomar decisões informadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}