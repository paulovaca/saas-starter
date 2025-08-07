'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Upload, Save } from 'lucide-react';
import { ContractData } from '@/lib/types/proposal';
import { updateContractData } from '@/lib/actions/proposals/status-transitions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BRAZILIAN_STATES } from '@/lib/constants/brazil';
import { validateCPF, validateCNPJ, formatCEP } from '@/lib/utils/validation';
import styles from './contract-data-form.module.css';

const contractDataSchema = z.object({
  // Dados pessoais
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string().min(1, 'Documento é obrigatório'),
  birthDate: z.string().optional(),
  
  // Endereço
  zipcode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  
  // Dados da viagem
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  destination: z.string().optional(),
  numberOfPassengers: z.number().min(1).optional(),
  specialRequests: z.string().optional(),
  
  // Contato de emergência
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  
  // URLs
  contractUrl: z.string().optional(),
  approvalEvidence: z.string().optional(),
});

type ContractDataFormValues = z.infer<typeof contractDataSchema>;

interface ContractDataFormProps {
  proposalId: string;
  initialData?: ContractData;
  contractUrl?: string;
  approvalEvidence?: string;
}

export default function ContractDataForm({
  proposalId,
  initialData,
  contractUrl,
  approvalEvidence
}: ContractDataFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ContractDataFormValues>({
    resolver: zodResolver(contractDataSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      documentType: initialData?.documentType || 'cpf',
      documentNumber: initialData?.documentNumber || '',
      birthDate: initialData?.birthDate || '',
      
      zipcode: initialData?.address?.zipcode || '',
      street: initialData?.address?.street || '',
      number: initialData?.address?.number || '',
      complement: initialData?.address?.complement || '',
      neighborhood: initialData?.address?.neighborhood || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      
      departureDate: initialData?.travelDetails?.departureDate || '',
      returnDate: initialData?.travelDetails?.returnDate || '',
      destination: initialData?.travelDetails?.destination || '',
      numberOfPassengers: initialData?.travelDetails?.numberOfPassengers || 1,
      specialRequests: initialData?.travelDetails?.specialRequests || '',
      
      emergencyContactName: initialData?.emergencyContact?.name || '',
      emergencyContactPhone: initialData?.emergencyContact?.phone || '',
      emergencyContactRelationship: initialData?.emergencyContact?.relationship || '',
      
      contractUrl: contractUrl || '',
      approvalEvidence: approvalEvidence || '',
    }
  });

  const documentType = form.watch('documentType');

  const onSubmit = async (data: ContractDataFormValues) => {
    setLoading(true);
    try {
      // Validar documento
      if (data.documentNumber) {
        if (data.documentType === 'cpf' && !validateCPF(data.documentNumber)) {
          toast.error('CPF inválido');
          return;
        }
        if (data.documentType === 'cnpj' && !validateCNPJ(data.documentNumber)) {
          toast.error('CNPJ inválido');
          return;
        }
      }

      // Estruturar dados do contrato
      const contractData: ContractData = {
        fullName: data.fullName,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        birthDate: data.birthDate,
        
        address: {
          zipcode: data.zipcode,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        },
        
        travelDetails: {
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          destination: data.destination,
          numberOfPassengers: data.numberOfPassengers,
          specialRequests: data.specialRequests,
        },
        
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: data.emergencyContactRelationship,
        },
      };

      const result = await updateContractData({
        proposalId,
        contractData,
        contractUrl: data.contractUrl,
        approvalEvidence: data.approvalEvidence,
      });

      if (result.success) {
        toast.success('Dados do contrato salvos com sucesso!');
        router.push(`/proposals/${proposalId}`);
      } else {
        throw new Error('Erro ao salvar dados');
      }
    } catch (error) {
      console.error('Erro ao salvar dados do contrato:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipCodeChange = async (zipcode: string) => {
    const formatted = formatCEP(zipcode);
    form.setValue('zipcode', formatted);

    // Auto-complete endereço via CEP (implementação futura)
    if (formatted.length === 9) {
      // TODO: Integrar com API de CEP
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formGrid}>
        
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Informações do cliente para o contrato
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Nome completo do cliente"
                />
                {form.formState.errors.fullName && (
                  <span className={styles.errorText}>{form.formState.errors.fullName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select 
                  value={documentType}
                  onValueChange={(value) => form.setValue('documentType', value as 'cpf' | 'cnpj')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="documentNumber">{documentType.toUpperCase()} *</Label>
                <Input
                  id="documentNumber"
                  {...form.register('documentNumber')}
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
                {form.formState.errors.documentNumber && (
                  <span className={styles.errorText}>{form.formState.errors.documentNumber.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...form.register('birthDate')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Endereço completo do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="zipcode">CEP</Label>
                <Input
                  id="zipcode"
                  {...form.register('zipcode')}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formField} ${styles.formFieldFlex2}`}>
                <Label htmlFor="street">Logradouro</Label>
                <Input
                  id="street"
                  {...form.register('street')}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  {...form.register('number')}
                  placeholder="123"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...form.register('complement')}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  {...form.register('neighborhood')}
                  placeholder="Bairro"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formField} ${styles.formFieldFlex2}`}>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="Cidade"
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="state">Estado</Label>
                <Select 
                  value={form.watch('state')}
                  onValueChange={(value) => form.setValue('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map(state => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Viagem */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Viagem</CardTitle>
            <CardDescription>
              Informações específicas da viagem contratada
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="departureDate">Data de Ida</Label>
                <Input
                  id="departureDate"
                  type="date"
                  {...form.register('departureDate')}
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="returnDate">Data de Volta</Label>
                <Input
                  id="returnDate"
                  type="date"
                  {...form.register('returnDate')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={`${styles.formField} ${styles.formFieldFlex2}`}>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  {...form.register('destination')}
                  placeholder="Destino da viagem"
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="numberOfPassengers">Nº de Passageiros</Label>
                <Input
                  id="numberOfPassengers"
                  type="number"
                  min="1"
                  {...form.register('numberOfPassengers', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="specialRequests">Solicitações Especiais</Label>
                <Textarea
                  id="specialRequests"
                  {...form.register('specialRequests')}
                  placeholder="Restrições alimentares, mobilidade, etc."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
            <CardDescription>
              Pessoa para contato em caso de emergência
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formRow}>
              <div className={`${styles.formField} ${styles.formFieldFlex2}`}>
                <Label htmlFor="emergencyContactName">Nome</Label>
                <Input
                  id="emergencyContactName"
                  {...form.register('emergencyContactName')}
                  placeholder="Nome do contato de emergência"
                />
              </div>
              
              <div className={styles.formField}>
                <Label htmlFor="emergencyContactPhone">Telefone</Label>
                <Input
                  id="emergencyContactPhone"
                  {...form.register('emergencyContactPhone')}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="emergencyContactRelationship">Parentesco</Label>
                <Input
                  id="emergencyContactRelationship"
                  {...form.register('emergencyContactRelationship')}
                  placeholder="Cônjuge, Filho(a), Pai/Mãe, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos e Evidências */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Links e evidências relacionadas ao contrato
            </CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="contractUrl">URL do Contrato</Label>
                <Input
                  id="contractUrl"
                  {...form.register('contractUrl')}
                  placeholder="https://link-do-contrato.com"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <Label htmlFor="approvalEvidence">Evidência de Aprovação</Label>
                <Textarea
                  id="approvalEvidence"
                  {...form.register('approvalEvidence')}
                  placeholder="Link do print de conversa, email de aprovação, etc."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />
      
      <div className={styles.formActions}>
        <Button type="submit" disabled={loading} className={styles.saveButton}>
          {loading ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className={styles.buttonIcon} />
              Salvar Dados do Contrato
            </>
          )}
        </Button>
      </div>
    </form>
  );
}