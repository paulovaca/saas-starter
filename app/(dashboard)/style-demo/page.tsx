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
                  className={styles.inputWithIcon}
                />
                <Search className={styles.inputIcon} />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="disabled">Campo desabilitado</Label>
              <Input 
                id="disabled" 
                placeholder="Campo desabilitado" 
                disabled
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="error">Campo com erro</Label>
              <Input 
                id="error" 
                placeholder="Campo com erro" 
                aria-invalid="true"
                className={styles.errorInput}
              />
              <p className={styles.errorText}>Este campo é obrigatório</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Cards */}
      <div className={styles.cardsSection}>
        <h2 className={styles.sectionHeader}>Cards e Superfícies</h2>
        <div className={styles.cardsGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Total de Clientes</CardTitle>
              <CardDescription>Clientes ativos no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${styles.cardValue} ${styles.cardValuePrimary}`}>1,234</div>
              <p className={styles.cardDescription}>
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
              <div className={`${styles.cardValue} ${styles.cardValueWarning}`}>56</div>
              <p className={styles.cardDescription}>
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
              <div className={`${styles.cardValue} ${styles.cardValueSuccess}`}>89</div>
              <p className={styles.cardDescription}>
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
          <div className={styles.colorsGrid}>
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchPrimary}`}></div>
              <p className={styles.colorName}>Primary</p>
              <p className={styles.colorUsage}>Ações principais</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchSecondary}`}></div>
              <p className={styles.colorName}>Secondary</p>
              <p className={styles.colorUsage}>Ações secundárias</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchSuccess}`}></div>
              <p className={styles.colorName}>Success</p>
              <p className={styles.colorUsage}>Estados positivos</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchWarning}`}></div>
              <p className={styles.colorName}>Warning</p>
              <p className={styles.colorUsage}>Atenção</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchDestructive}`}></div>
              <p className={styles.colorName}>Destructive</p>
              <p className={styles.colorUsage}>Ações perigosas</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchMuted}`}></div>
              <p className={styles.colorName}>Muted</p>
              <p className={styles.colorUsage}>Backgrounds neutros</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchAccent}`}></div>
              <p className={styles.colorName}>Accent</p>
              <p className={styles.colorUsage}>Destaques</p>
            </div>
            
            <div className={styles.colorItem}>
              <div className={`${styles.colorSwatch} ${styles.colorSwatchCard}`}></div>
              <p className={styles.colorName}>Card</p>
              <p className={styles.colorUsage}>Superfícies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas de UX */}
      <Card className={styles.tipCard}>
        <CardHeader>
          <CardTitle className={styles.tipTitle}>
            <CheckCircle className={styles.tipIcon} />
            ✅ Problema dos Botões Resolvido!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.tipContent}>
            <p className={styles.tipText}>
              <strong>Problema identificado e corrigido:</strong> Os botões estavam com a mesma cor do fundo devido a:
            </p>
            <ul className={styles.tipList}>
              <li>Duplicação de imports no CSS</li>
              <li>Conflitos nas variáveis de cor</li>
              <li>Classes customizadas sobrescrevendo os estilos padrão</li>
            </ul>
            
            <div className={styles.solutionsSection}>
              <p className={styles.solutionsTitle}>✅ Soluções implementadas:</p>
              <ul className={styles.solutionsList}>
                <li>🔧 CSS limpo e organizado sem duplicações</li>
                <li>🎨 Cores com contraste adequado (azul vibrante para primary)</li>
                <li>⚡ Botões com efeitos visuais (escala no clique)</li>
                <li>🌙 Temas claro/escuro balanceados</li>
                <li>♿ Acessibilidade aprimorada</li>
                <li>🔄 Transições suaves em todos os componentes</li>
              </ul>
            </div>

            <div className={styles.testSection}>
              <p className={styles.testTitle}>🎯 Teste agora:</p>
              <div className={styles.testButtons}>
                <Button size="sm">Botão Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="success" size="sm">Success</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
              <p className={styles.testNote}>
                Todos com cores bem definidas e contrastantes! 🎉
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
