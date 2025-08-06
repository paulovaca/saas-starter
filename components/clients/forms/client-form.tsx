'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, User, Mail, Phone, FileText, MapPin, Briefcase } from 'lucide-react';
import { clientSchema, formatCPF, formatCNPJ, formatPhone, formatCEP } from '@/lib/validations/clients/client.schema';
import { ClientFormData } from '@/lib/types/clients';
import styles from './client-form.module.css';

// Schema específico para o formulário (apenas nome e telefone obrigatórios)
const clientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  documentType: z.enum(['cpf', 'cnpj']).optional(),
  documentNumber: z.string().optional(),
  birthDate: z.string().optional(),
  addressZipcode: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;
type ProcessedClientFormData = ClientFormValues;

interface ClientFormProps {
  initialData?: Partial<ClientFormData> & { id?: string };
  onSubmit: (data: ProcessedClientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function ClientForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  submitLabel = 'Salvar Cliente' 
}: ClientFormProps) {
  // Estados
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingDocument, setIsCheckingDocument] = useState(false);
  // Removidos estados de loading de endereço

  // Form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      documentType: initialData?.documentType || 'cpf',
      documentNumber: initialData?.documentNumber || '',
      birthDate: (() => {
        if (!initialData?.birthDate) return '';
        if (typeof initialData.birthDate === 'string') return (initialData.birthDate as string).split('T')[0];
        return (initialData.birthDate as Date).toISOString().split('T')[0];
      })(),
      addressZipcode: initialData?.addressZipcode || '',
      addressStreet: initialData?.addressStreet || '',
      addressNumber: initialData?.addressNumber || '',
      addressComplement: initialData?.addressComplement || '',
      addressNeighborhood: initialData?.addressNeighborhood || '',
      addressCity: initialData?.addressCity || '',
      addressState: initialData?.addressState || '',
      notes: initialData?.notes || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = form;

  const documentType = watch('documentType');
  const documentNumber = watch('documentNumber');
  const email = watch('email');
  const phone = watch('phone');
  const addressZipcode = watch('addressZipcode');

  // Formatação em tempo real do documento
  useEffect(() => {
    if (documentNumber) {
      const formatted = documentType === 'cpf' 
        ? formatCPF(documentNumber) 
        : formatCNPJ(documentNumber);
      
      if (formatted !== documentNumber) {
        setValue('documentNumber', formatted);
      }
    }
  }, [documentNumber, documentType, setValue]);

  // Formatação em tempo real do telefone
  useEffect(() => {
    if (phone) {
      const formatted = formatPhone(phone);
      if (formatted !== phone) {
        setValue('phone', formatted);
      }
    }
  }, [phone, setValue]);

  // Formatação em tempo real do CEP
  useEffect(() => {
    if (addressZipcode) {
      const formatted = formatCEP(addressZipcode);
      if (formatted !== addressZipcode) {
        setValue('addressZipcode', formatted);
      }
    }
  }, [addressZipcode, setValue]);

  // Removida busca automática de CEP por requisição do usuário

  // Validação de email único
  const validateEmail = async (email: string) => {
    if (!email || email === initialData?.email) return true;
    
    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/clients/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          excludeId: initialData?.id
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao validar email');
        return true; // Em caso de erro, permitir continuar
      }
      
      const data = await response.json();
      
      if (!data.isUnique) {
        setError('email', { message: 'Este email já está sendo usado por outro cliente' });
        return false;
      }
      
      clearErrors('email');
      return true;
    } catch (error) {
      console.error('Erro ao validar email:', error);
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Validação de documento único
  const validateDocument = async (documentNumber: string) => {
    if (!documentNumber || documentNumber === initialData?.documentNumber) return true;
    
    setIsCheckingDocument(true);
    try {
      const response = await fetch('/api/clients/check-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentNumber,
          excludeId: initialData?.id
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao validar documento');
        return true; // Em caso de erro, permitir continuar
      }
      
      const data = await response.json();
      
      if (!data.isUnique) {
        setError('documentNumber', { message: 'Este documento já está sendo usado por outro cliente' });
        return false;
      }
      
      clearErrors('documentNumber');
      return true;
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      return true;
    } finally {
      setIsCheckingDocument(false);
    }
  };

  // Handler para submit do formulário
  const handleFormSubmit = async (data: ClientFormValues) => {
    try {
      // Validar email e documento apenas se preenchidos e se for um novo cliente
      const validationPromises = [];
      
      // Só validar unicidade se for um novo cliente (não tem ID)
      if (!initialData?.id) {
        if (data.email) {
          validationPromises.push(validateEmail(data.email));
        }
        
        if (data.documentNumber) {
          validationPromises.push(validateDocument(data.documentNumber));
        }
        
        const validationResults = await Promise.all(validationPromises);
        
        if (validationResults.includes(false)) {
          return;
        }
      }
      
      // Limpar documentType se não houver documentNumber
      const processedData: ProcessedClientFormData = {
        ...data,
        documentType: data.documentNumber && data.documentNumber.trim() !== '' ? data.documentType : undefined,
        birthDate: data.birthDate && data.birthDate.trim() !== '' ? data.birthDate : undefined,
      };
      
      // Enviar dados processados
      await onSubmit(processedData);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.clientForm}>
      {/* Dados Básicos */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formCardHeader}>
          <CardTitle className={styles.formCardTitle}>
            <User className={styles.formCardTitleIcon} />
            Dados Básicos
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.formCardContent}>
          <div className={styles.formGridTwoCols}>
            <div className={styles.formField}>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Digite o nome completo"
                className={errors.name ? styles.formInputError : ''}
              />
              {errors.name && (
                <p className={styles.formError}>{errors.name.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="email">Email</Label>
              <div className={styles.formInputContainer}>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Digite o email"
                  className={errors.email ? styles.formInputError : ''}
                  onBlur={(e) => !initialData?.id && validateEmail(e.target.value)}
                />
                {isCheckingEmail && (
                  <Loader2 className={styles.formInputSpinner} />
                )}
              </div>
              {errors.email && (
                <p className={styles.formError}>{errors.email.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(11) 99999-9999"
                className={errors.phone ? styles.formInputError : ''}
              />
              {errors.phone && (
                <p className={styles.formError}>{errors.phone.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                className={errors.birthDate ? styles.formInputError : ''}
              />
              {errors.birthDate && (
                <p className={styles.formError}>{errors.birthDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documento */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formCardHeader}>
          <CardTitle className={styles.formCardTitle}>
            <FileText className={styles.formCardTitleIcon} />
            Documento
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.formCardContent}>
          <div className={styles.documentTypeSection}>
            <Label>Tipo de Documento</Label>
            <RadioGroup
              value={documentType}
              onValueChange={(value) => setValue('documentType', value as 'cpf' | 'cnpj')}
              className={styles.formRadioGroup}
            >
              <div className={styles.formRadioItem}>
                <RadioGroupItem value="cpf" id="cpf" />
                <Label htmlFor="cpf">CPF</Label>
              </div>
              <div className={styles.formRadioItem}>
                <RadioGroupItem value="cnpj" id="cnpj" />
                <Label htmlFor="cnpj">CNPJ</Label>
              </div>
            </RadioGroup>
          </div>

          <div className={styles.formField}>
            <Label htmlFor="documentNumber">
              Número do {documentType === 'cpf' ? 'CPF' : 'CNPJ'}
            </Label>
            <div className={styles.formInputContainer}>
              <Input
                id="documentNumber"
                {...register('documentNumber')}
                placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                className={errors.documentNumber ? styles.formInputError : ''}
                onBlur={(e) => !initialData?.id && validateDocument(e.target.value)}
              />
              {isCheckingDocument && (
                <Loader2 className={styles.formInputSpinner} />
              )}
            </div>
            {errors.documentNumber && (
              <p className={styles.formError}>{errors.documentNumber.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formCardHeader}>
          <CardTitle className={styles.formCardTitle}>
            <MapPin className={styles.formCardTitleIcon} />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.formCardContent}>
          <div className={styles.addressGrid}>
            <div className={styles.formField}>
              <Label htmlFor="addressZipcode">CEP</Label>
              <div className={styles.formInputContainer}>
                <Input
                  id="addressZipcode"
                  {...register('addressZipcode')}
                  placeholder="00000-000"
                  className={errors.addressZipcode ? styles.formInputError : ''}
                />
              </div>
              {errors.addressZipcode && (
                <p className={styles.formError}>{errors.addressZipcode.message}</p>
              )}
            </div>

            <div className={`${styles.formField} ${styles.addressStreetField}`}>
              <Label htmlFor="addressStreet">Logradouro</Label>
              <Input
                id="addressStreet"
                {...register('addressStreet')}
                placeholder="Rua, Avenida, etc."
                className={errors.addressStreet ? styles.formInputError : ''}
              />
              {errors.addressStreet && (
                <p className={styles.formError}>{errors.addressStreet.message}</p>
              )}
            </div>
          </div>

          <div className={styles.addressFullGrid}>
            <div className={styles.formField}>
              <Label htmlFor="addressNumber">Número</Label>
              <Input
                id="addressNumber"
                {...register('addressNumber')}
                placeholder="123"
                className={errors.addressNumber ? styles.formInputError : ''}
              />
              {errors.addressNumber && (
                <p className={styles.formError}>{errors.addressNumber.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="addressComplement">Complemento</Label>
              <Input
                id="addressComplement"
                {...register('addressComplement')}
                placeholder="Apto, Bloco, etc."
                className={errors.addressComplement ? styles.formInputError : ''}
              />
              {errors.addressComplement && (
                <p className={styles.formError}>{errors.addressComplement.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="addressNeighborhood">Bairro</Label>
              <Input
                id="addressNeighborhood"
                {...register('addressNeighborhood')}
                placeholder="Nome do bairro"
                className={errors.addressNeighborhood ? styles.formInputError : ''}
              />
              {errors.addressNeighborhood && (
                <p className={styles.formError}>{errors.addressNeighborhood.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="addressCity">Cidade</Label>
              <Input
                id="addressCity"
                {...register('addressCity')}
                placeholder="Nome da cidade"
                className={errors.addressCity ? styles.formInputError : ''}
              />
              {errors.addressCity && (
                <p className={styles.formError}>{errors.addressCity.message}</p>
              )}
            </div>

            <div className={styles.formField}>
              <Label htmlFor="addressState">Estado</Label>
              <Input
                id="addressState"
                {...register('addressState')}
                placeholder="UF"
                maxLength={2}
                className={errors.addressState ? styles.formInputError : ''}
              />
              {errors.addressState && (
                <p className={styles.formError}>{errors.addressState.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comercial */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formCardHeader}>
          <CardTitle className={styles.formCardTitle}>
            <Briefcase className={styles.formCardTitleIcon} />
            Informações Comerciais
          </CardTitle>
        </CardHeader>
        <CardContent className={styles.formCardContent}>
          <div className={styles.formField}>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Informações adicionais sobre o cliente..."
              rows={3}
              className={`${styles.formTextarea} ${errors.notes ? styles.formInputError : ''}`}
            />
            {errors.notes && (
              <p className={styles.formError}>{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className={styles.formActions}>
        <Button type="button" variant="outline" onClick={onCancel} className={styles.formButtonSecondary}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading} className={styles.formButtonPrimary}>
          {(isSubmitting || isLoading) && <Loader2 className={styles.formLoadingSpinner} />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
