"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Settings
} from "lucide-react";
import styles from "./page.module.css";

export default function StyleDemo() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Demonstração do Sistema de Design
        </h1>
        <p className={styles.description}>
          Veja como ficaram os novos estilos dos componentes com tema claro/escuro otimizado.
        </p>
      </div>

      {/* Seção de Botões */}
      <Card>
        <CardHeader>
          <CardTitle>Botões</CardTitle>
          <CardDescription>
            Diferentes variantes e tamanhos de botões com estados visuais aprimorados.
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.content}>
          <div className={styles.section}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Variantes</h3>
              <div className={styles.buttonGroup}>
                <Button variant="default">
                  <Save className={styles.buttonIcon} />
                  Salvar
                </Button>
                <Button variant="secondary">
                  <Edit className={styles.buttonIcon} />
                  Editar
                </Button>
                <Button variant="outline">
                  <Filter className={styles.buttonIcon} />
                  Filtrar
                </Button>
                <Button variant="ghost">
                  <Settings className={styles.buttonIcon} />
                  Configurações
                </Button>
                <Button variant="destructive">
                  <Trash2 className={styles.buttonIcon} />
                  Excluir
                </Button>
                <Button variant="success">
                  <CheckCircle className={styles.buttonIcon} />
                  Confirmar
                </Button>
                <Button variant="warning">
                  <AlertCircle className={styles.buttonIcon} />
                  Atenção
                </Button>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Tamanhos</h3>
              <div className={styles.buttonSizeGroup}>
                <Button size="sm">
                  <Plus className={styles.buttonIcon} />
                  Pequeno
                </Button>
                <Button size="default">
                  <Download className={styles.buttonIcon} />
                  Padrão
                </Button>
                <Button size="lg">
                  <Upload className={styles.buttonIcon} />
                  Grande
                </Button>
                <Button size="icon" variant="outline">
                  <Search className={styles.buttonIcon} />
                </Button>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Estados</h3>
              <div className={styles.buttonGroup}>
                <Button>Normal</Button>
                <Button disabled>Desabilitado</Button>
                <Button className={styles.loadingState}>Loading...</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Campos de Entrada</CardTitle>
          <CardDescription>
            Inputs com melhor experiência visual e de interação.
          </CardDescription>
        </CardHeader>
        <CardContent className={styles.content}>
          <div className={styles.inputGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="name">Nome completo</Label>
              <Input 
                id="name" 
                placeholder="Digite seu nome completo" 
                defaultValue="João da Silva"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(11) 99999-9999" 
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="search">Busca</Label>
              <div className={styles.relative}>
                <Input 
                  id="search" 
                  placeholder="Buscar clientes..." 
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disabled">Campo desabilitado</Label>
              <Input 
                id="disabled" 
                placeholder="Campo desabilitado" 
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="error">Campo com erro</Label>
              <Input 
                id="error" 
                placeholder="Campo com erro" 
                aria-invalid="true"
                className="border-destructive"
              />
              <p className="text-sm text-destructive">Este campo é obrigatório</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Cards e Superfícies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total de Clientes</CardTitle>
              <CardDescription>Clientes ativos no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,234</div>
              <p className="text-sm text-muted-foreground mt-2">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propostas Ativas</CardTitle>
              <CardDescription>Em negociação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">56</div>
              <p className="text-sm text-muted-foreground mt-2">
                23 precisam de follow-up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendas do Mês</CardTitle>
              <CardDescription>Fechadas com sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">89</div>
              <p className="text-sm text-muted-foreground mt-2">
                Meta: 100 vendas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Paleta de Cores */}
      <Card>
        <CardHeader>
          <CardTitle>Paleta de Cores</CardTitle>
          <CardDescription>
            Cores principais do sistema que se adaptam automaticamente ao tema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-12 bg-primary rounded-md"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">Ações principais</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-secondary rounded-md"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">Ações secundárias</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-success rounded-md"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-muted-foreground">Estados positivos</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-warning rounded-md"></div>
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-muted-foreground">Atenção</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-destructive rounded-md"></div>
              <p className="text-sm font-medium">Destructive</p>
              <p className="text-xs text-muted-foreground">Ações perigosas</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-muted rounded-md"></div>
              <p className="text-sm font-medium">Muted</p>
              <p className="text-xs text-muted-foreground">Backgrounds neutros</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-accent rounded-md"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">Destaques</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-12 bg-card border rounded-md"></div>
              <p className="text-sm font-medium">Card</p>
              <p className="text-xs text-muted-foreground">Superfícies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas de UX */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-success">
            <CheckCircle className="w-5 h-5 inline mr-2" />
            ✅ Problema dos Botões Resolvido!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-foreground">
              <strong>Problema identificado e corrigido:</strong> Os botões estavam com a mesma cor do fundo devido a:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Duplicação de imports no CSS</li>
              <li>Conflitos nas variáveis de cor</li>
              <li>Classes customizadas sobrescrevendo os estilos padrão</li>
            </ul>
            
            <div className="border-t pt-4">
              <p className="font-medium text-foreground mb-2">✅ Soluções implementadas:</p>
              <ul className="space-y-1 text-sm">
                <li>🔧 CSS limpo e organizado sem duplicações</li>
                <li>🎨 Cores com contraste adequado (azul vibrante para primary)</li>
                <li>⚡ Botões com efeitos visuais (escala no clique)</li>
                <li>🌙 Temas claro/escuro balanceados</li>
                <li>♿ Acessibilidade aprimorada</li>
                <li>🔄 Transições suaves em todos os componentes</li>
              </ul>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">🎯 Teste agora:</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm">Botão Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="success" size="sm">Success</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todos com cores bem definidas e contrastantes! 🎉
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
