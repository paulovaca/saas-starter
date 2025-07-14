import Link from 'next/link';
import { CircleIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <CircleIcon className="size-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Página Não Encontrada
        </h1>
        <p className="text-base text-muted-foreground">
          A página que você está procurando pode ter sido removida, teve seu nome
          alterado ou está temporariamente indisponível.
        </p>
        <Link
          href="/"
          className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
