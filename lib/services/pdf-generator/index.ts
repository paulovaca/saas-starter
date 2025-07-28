/**
 * PDF Generator Service for Proposals
 * Generates professional PDF documents for proposals
 */

import { ProposalWithRelations } from '@/lib/types/proposals';
import { formatCurrency } from '@/lib/services/proposal-calculator';

// Basic PDF generation interface
// TODO: Implement with a PDF library like react-pdf, puppeteer, or jsPDF

export interface PDFGeneratorOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
  watermark?: string;
}

export interface PDFResult {
  success: boolean;
  buffer?: Buffer;
  error?: string;
  filename: string;
}

/**
 * Generate PDF for a proposal
 */
export async function generateProposalPDF(
  proposal: ProposalWithRelations,
  options: Partial<PDFGeneratorOptions> = {}
): Promise<PDFResult> {
  try {
    const defaultOptions: PDFGeneratorOptions = {
      format: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      ...options
    };

    // For now, return a mock result
    // TODO: Implement actual PDF generation
    const filename = `proposta-${proposal.proposalNumber.replace('/', '-')}.pdf`;
    
    console.log('Generating PDF for proposal:', proposal.proposalNumber);
    console.log('Options:', defaultOptions);
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock PDF buffer (in real implementation, this would be the actual PDF)
    const mockPDFContent = generateMockPDFContent(proposal);
    const buffer = Buffer.from(mockPDFContent, 'utf-8');

    return {
      success: true,
      buffer,
      filename
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar PDF',
      filename: ''
    };
  }
}

/**
 * Generate HTML template for PDF conversion
 */
export function generateProposalHTML(proposal: ProposalWithRelations): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proposta ${proposal.proposalNumber}</title>
      <style>
        ${getPDFStyles()}
      </style>
    </head>
    <body>
      <div class="proposal-document">
        <!-- Header -->
        <header class="proposal-header">
          <div class="company-info">
            <h1>Nome da Agência</h1>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Email: contato@agencia.com | Telefone: (11) 99999-9999</p>
          </div>
          <div class="proposal-info">
            <h2>Proposta ${proposal.proposalNumber}</h2>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>Válida até: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        <!-- Client Info -->
        <section class="client-section">
          <h3>Dados do Cliente</h3>
          <div class="client-info">
            <p><strong>Nome:</strong> ${proposal.client.name}</p>
            <p><strong>Email:</strong> ${proposal.client.email}</p>
            <p><strong>Documento:</strong> ${proposal.client.documentNumber}</p>
          </div>
        </section>

        <!-- Items -->
        <section class="items-section">
          <h3>Itens da Proposta</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${proposal.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.description ? `<br><small>${item.description}</small>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <!-- Financial Summary -->
        <section class="financial-section">
          <div class="financial-summary">
            <div class="summary-line">
              <span>Subtotal:</span>
              <span>${formatCurrency(proposal.subtotal)}</span>
            </div>
            ${proposal.discountAmount && proposal.discountAmount > 0 ? `
              <div class="summary-line">
                <span>Desconto ${proposal.discountPercent ? `(${proposal.discountPercent}%)` : ''}:</span>
                <span>-${formatCurrency(proposal.discountAmount)}</span>
              </div>
            ` : ''}
            <div class="summary-line total-line">
              <span><strong>Total:</strong></span>
              <span><strong>${formatCurrency(proposal.totalAmount)}</strong></span>
            </div>
          </div>
        </section>

        <!-- Notes -->
        ${proposal.notes ? `
          <section class="notes-section">
            <h3>Observações</h3>
            <p>${proposal.notes}</p>
          </section>
        ` : ''}

        <!-- Footer -->
        <footer class="proposal-footer">
          <p>Esta proposta é válida até ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}.</p>
          <p>Agradecemos a preferência!</p>
          <div class="qr-section">
            <p><small>Acesse o link para aceitar esta proposta:</small></p>
            <!-- QR code would go here -->
          </div>
        </footer>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get CSS styles for PDF
 */
function getPDFStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      font-size: 12px;
    }

    .proposal-document {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .proposal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .company-info h1 {
      color: #007bff;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .proposal-info {
      text-align: right;
    }

    .proposal-info h2 {
      color: #007bff;
      font-size: 20px;
      margin-bottom: 10px;
    }

    .client-section, .items-section, .financial-section, .notes-section {
      margin-bottom: 30px;
    }

    h3 {
      color: #007bff;
      font-size: 16px;
      margin-bottom: 15px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }

    .client-info p {
      margin-bottom: 5px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .items-table th,
    .items-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    .items-table th {
      background-color: #f8f9fa;
      font-weight: bold;
    }

    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: right;
    }

    .financial-summary {
      margin-left: auto;
      width: 300px;
      border: 1px solid #ddd;
      padding: 15px;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .total-line {
      border-top: 2px solid #007bff;
      padding-top: 10px;
      font-size: 14px;
    }

    .proposal-footer {
      border-top: 1px solid #ddd;
      padding-top: 20px;
      margin-top: 30px;
      text-align: center;
    }

    .qr-section {
      margin-top: 20px;
    }

    @media print {
      .proposal-document {
        padding: 0;
      }
    }
  `;
}

/**
 * Generate mock PDF content (for development)
 */
function generateMockPDFContent(proposal: ProposalWithRelations): string {
  return `
PROPOSTA COMERCIAL - ${proposal.proposalNumber}
===============================================

Cliente: ${proposal.client.name}
Email: ${proposal.client.email}
Documento: ${proposal.client.documentNumber}

Operadora: ${proposal.operator.name}
Responsável: ${proposal.user.name}

ITENS:
------
${proposal.items.map(item => 
  `${item.name} - Qtd: ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.subtotal)}`
).join('\n')}

RESUMO FINANCEIRO:
------------------
Subtotal: ${formatCurrency(proposal.subtotal)}
${proposal.discountAmount ? `Desconto: -${formatCurrency(proposal.discountAmount)}` : ''}
TOTAL: ${formatCurrency(proposal.totalAmount)}

Válida até: ${new Date(proposal.validUntil).toLocaleDateString('pt-BR')}

${proposal.notes ? `\nObservações:\n${proposal.notes}` : ''}

Agradecemos a preferência!
`;
}

/**
 * Download PDF file
 */
export function downloadPDF(buffer: Buffer, filename: string): void {
  if (typeof window !== 'undefined') {
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}