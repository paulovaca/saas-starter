'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createOperator } from '@/lib/actions/operators/create-operator';
import { updateOperator } from '@/lib/actions/operators/update-operator';
import { createOperatorSchema, updateOperatorSchema, type CreateOperatorInput, type UpdateOperatorInput } from '@/lib/validations/operators/operator.schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Operator } from '@/lib/db/schema';
import { OperatorDetails } from '@/lib/actions/operators/get-operator-details';
import { Loader2 } from 'lucide-react';
import styles from './operator-form-modal.module.css';
import { useInputMask } from '@/hooks/use-input-mask';

interface OperatorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator?: Operator | OperatorDetails;
}

interface FormData {
  id?: string;
  name: string;
  logo?: string;
  cnpj?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: {
    street?: string;
    number?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  notes?: string;
}

export function OperatorFormModal({ isOpen, onClose, operator }: OperatorFormModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!operator;
  const { applyMask, createMaskedHandler } = useInputMask();

  // Convert address string back to object for editing
  const getAddressObject = (addressString?: string) => {
    if (!addressString) return {};
    // Parse the address string back to object (basic implementation)
    const parts = addressString.split(', ');
    return {
      street: parts[0] || '',
      number: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      zipCode: parts[4] || '',
      country: parts[5] || '',
    };
  };

  const form = useForm({
    resolver: zodResolver(isEditing ? updateOperatorSchema : createOperatorSchema),
    defaultValues: {
      name: operator?.name || '',
      logo: operator?.logo || '',
      cnpj: operator?.cnpj || '',
      description: (operator as any)?.description || '',
      contactName: operator?.contactName || '',
      contactEmail: operator?.contactEmail || '',
      contactPhone: operator?.contactPhone || '',
      website: (operator as any)?.website || '',
      address: operator?.address ? getAddressObject(operator.address) : {
        street: '',
        number: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      notes: operator?.notes || '',
      ...(isEditing && operator ? { id: operator.id } : {}),
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('🔥 onSubmit DISPARADO!');
    console.log('📊 Data recebida:', data);
    console.log('✏️ isEditing:', isEditing);
    
    setIsLoading(true);
    try {
      if (isEditing && operator) {
        console.log('🔄 Entrando no fluxo de UPDATE...');
        const updateData: UpdateOperatorInput = {
          id: operator.id,
          name: data.name,
          logo: data.logo,
          cnpj: data.cnpj,
          description: data.description,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          website: data.website,
          address: data.address,
          notes: data.notes,
        };
        
        const result = await updateOperator(updateData);
        console.log('📥 Resultado do update:', result);
        
        if (result.success) {
          toast.success('Operadora atualizada com sucesso!');
          handleCancel();
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        console.log('➕ Entrando no fluxo de CREATE...');
        const createData: CreateOperatorInput = {
          name: data.name,
          logo: data.logo,
          cnpj: data.cnpj,
          description: data.description,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          website: data.website,
          address: data.address,
          notes: data.notes,
        };
        
        const result = await createOperator(createData);
        console.log('📥 Resultado do create:', result);
        
        if (result.success) {
          toast.success('Operadora criada com sucesso!');
          handleCancel();
          router.refresh();
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error('❌ ERRO no onSubmit:', error);
      toast.error('Erro ao processar operação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Não fecha automaticamente, só fecha por ação do usuário
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className={styles.modalContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Operadora' : 'Nova Operadora de Turismo'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da operadora de turismo.' 
              : 'Preencha as informações para cadastrar uma nova operadora de turismo parceira.'
            }
          </DialogDescription>
        </DialogHeader>

        <form 
          onSubmit={form.handleSubmit(
            onSubmit,
            (errors) => {
              console.log('❌ ERRO DE VALIDAÇÃO:', errors);
              console.log('❌ Detalhes dos erros:');
              Object.keys(errors).forEach(key => {
                console.log(`  - Campo "${key}":`, (errors as any)[key]?.message);
              });
              toast.error('Por favor, corrija os erros no formulário');
            }
          )} 
          className={styles.formContainer}
        >
          {/* Campo hidden para o ID quando editando */}
          {isEditing && operator && (
            <input type="hidden" name="id" value={operator.id} />
          )}
          
          <Tabs defaultValue="general" className={styles.formContainer}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="general">Dados Principais</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="additional">Adicional</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className={styles.tabContent}>
              <div className={styles.fieldGroup}>
                <div className={styles.formField}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Nome da Operadora *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Ex: CVC, Agaxtur, Decolar..."
                    {...form.register('name')}
                    className={styles.formInput}
                  />
                  {form.formState.errors.name && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className={styles.formField}>
                  <label htmlFor="cnpj" className={styles.formLabel}>
                    CNPJ
                  </label>
                  <input
                    id="cnpj"
                    type="text"
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    {...form.register('cnpj')}
                    onChange={createMaskedHandler('cnpj', (value) => form.setValue('cnpj', value))}
                    className={styles.formInput}
                  />
                  {form.formState.errors.cnpj && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.cnpj.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formField}>
                <label htmlFor="logo" className={styles.formLabel}>
                  URL do Logo
                </label>
                <input
                  id="logo"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  {...form.register('logo')}
                  className={styles.formInput}
                />
                <p className={styles.formDescription}>
                  URL da imagem do logo da operadora (opcional)
                </p>
                {form.formState.errors.logo && (
                  <p className={styles.formMessage}>
                    {form.formState.errors.logo.message}
                  </p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="description" className={styles.formLabel}>
                  Descrição
                </label>
                <textarea
                  id="description"
                  placeholder="Descreva a operadora, seus diferenciais e tipo de turismo..."
                  {...form.register('description')}
                  className={`${styles.formTextarea} ${styles.formTextareaLarge}`}
                />
                {form.formState.errors.description && (
                  <p className={styles.formMessage}>
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact" className={styles.tabContent}>
              <div className={styles.fieldGroup}>
                <div className={styles.formField}>
                  <label htmlFor="contactName" className={styles.formLabel}>
                    Nome do Contato
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    placeholder="Nome do responsável"
                    {...form.register('contactName')}
                    className={styles.formInput}
                  />
                  {form.formState.errors.contactName && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.contactName.message}
                    </p>
                  )}
                </div>

                <div className={styles.formField}>
                  <label htmlFor="contactEmail" className={styles.formLabel}>
                    Email de Contato
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    placeholder="contato@operadora.com"
                    {...form.register('contactEmail')}
                    className={styles.formInput}
                  />
                  {form.formState.errors.contactEmail && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.formField}>
                  <label htmlFor="contactPhone" className={styles.formLabel}>
                    Telefone de Contato
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    {...form.register('contactPhone')}
                    onChange={createMaskedHandler('phone', (value) => form.setValue('contactPhone', value))}
                    className={styles.formInput}
                  />
                  {form.formState.errors.contactPhone && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.contactPhone.message}
                    </p>
                  )}
                </div>

                <div className={styles.formField}>
                  <label htmlFor="website" className={styles.formLabel}>
                    Website
                  </label>
                  <input
                    id="website"
                    type="url"
                    placeholder="https://www.operadora.com"
                    {...form.register('website')}
                    className={styles.formInput}
                  />
                  {form.formState.errors.website && (
                    <p className={styles.formMessage}>
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Endereço</label>
                <div className={styles.fieldGroupThree}>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="Logradouro"
                      {...form.register('address.street')}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="Número"
                      {...form.register('address.number')}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="CEP"
                      {...form.register('address.zipCode')}
                      onChange={createMaskedHandler('cep', (value) => form.setValue('address.zipCode', value))}
                      className={styles.formInput}
                    />
                  </div>
                </div>
                
                <div className={styles.fieldGroupThree}>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="Cidade"
                      {...form.register('address.city')}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="Estado"
                      {...form.register('address.state')}
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formField}>
                    <input
                      type="text"
                      placeholder="País"
                      {...form.register('address.country')}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="additional" className={styles.tabContent}>
              <div className={styles.formField}>
                <label htmlFor="notes" className={styles.formLabel}>
                  Observações
                </label>
                <textarea
                  id="notes"
                  placeholder="Observações adicionais sobre a operadora de turismo"
                  {...form.register('notes')}
                  className={`${styles.formTextarea} ${styles.formTextareaLarge}`}
                />
                <p className={styles.formDescription}>
                  Informações extras, termos de parceria, especialidades, etc.
                </p>
                {form.formState.errors.notes && (
                  <p className={styles.formMessage}>
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className={styles.actionsContainer}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
              onClick={() => {
                console.log('🖱️ BOTÃO SUBMIT CLICADO!');
                console.log('🔍 Form state:', form.formState);
                console.log('🔍 Form errors:', form.formState.errors);
                console.log('🔍 Form values:', form.getValues());
                console.log('🔍 Form is valid:', form.formState.isValid);
                
                // Log detalhado dos erros
                const errors = form.formState.errors;
                Object.keys(errors).forEach(key => {
                  console.log(`❌ Erro no campo ${key}:`, (errors as any)[key]);
                });
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className={styles.loadingIcon} />
                  {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                isEditing ? 'Atualizar Operadora' : 'Cadastrar Operadora'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}