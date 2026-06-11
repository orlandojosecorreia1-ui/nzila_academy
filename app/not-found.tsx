import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06040a] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest block">
            ERRO 404
          </span>
          <h1 className="text-4xl font-bold font-display text-white">
            Página não encontrada
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            A página que procura não existe ou foi movida. Volte ao painel principal da Nzila Academy.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-mono font-bold transition-all"
        >
          ← Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
