import { Button } from '@/components/ui/button';

export default function TestButtons() {
  return (
    <div className="min-h-screen p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-8">Teste de Botões</h1>
      
      <div className="space-y-4">
        <Button variant="default">Botão Primary (Default)</Button>
        <Button variant="secondary">Botão Secondary</Button>
        <Button variant="outline">Botão Outline</Button>
        <Button variant="ghost">Botão Ghost</Button>
        <Button variant="destructive">Botão Destructive</Button>
        <Button variant="success">Botão Success</Button>
        <Button variant="warning">Botão Warning</Button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Cores CSS Custom:</h2>
        <div className="space-y-2">
          <div className="p-4 bg-primary text-primary-foreground">
            Primary: {getComputedStyle(document.documentElement).getPropertyValue('--primary')}
          </div>
          <div className="p-4 bg-secondary text-secondary-foreground">
            Secondary: {getComputedStyle(document.documentElement).getPropertyValue('--secondary')}
          </div>
          <div className="p-4 bg-accent text-accent-foreground">
            Accent: {getComputedStyle(document.documentElement).getPropertyValue('--accent')}
          </div>
        </div>
      </div>
    </div>
  );
}
