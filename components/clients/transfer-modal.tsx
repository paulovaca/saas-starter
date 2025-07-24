'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormModal } from '@/components/ui/form-modal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { transferClient } from '@/lib/actions/clients/transfer-client'
import { toast } from 'sonner'
import { useModal } from '@/lib/hooks/use-modal'
import { UserIcon, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'
import styles from './transfer-modal.module.css'

const transferSchema = z.object({
  toUserId: z.string().min(1, 'Selecione um novo responsável'),
  reason: z.string().min(20, 'A justificativa deve ter pelo menos 20 caracteres'),
  notifyNewAgent: z.boolean().default(true)
})

type TransferFormData = z.infer<typeof transferSchema>

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Client {
  id: string
  name: string
  email?: string | null
  userId: string
  user?: User
}

interface TransferModalProps {
  children: React.ReactNode
  client: Client
  users: User[]
  onSuccess?: () => void
}

export function TransferModal({
  children,
  client,
  users,
  onSuccess
}: TransferModalProps) {
  const modal = useModal()
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toUserId: '',
      reason: '',
      notifyNewAgent: true
    }
  })

  const watchedToUserId = watch('toUserId')
  const watchedReason = watch('reason')
  const watchedNotify = watch('notifyNewAgent')

  const selectedUser = users.find(u => u.id === watchedToUserId)
  const currentUser = client.user || users.find(u => u.id === client.userId)

  const availableUsers = users.filter(
    user => user.id !== client.userId && (user.role === 'AGENT' || user.role === 'ADMIN')
  )

  const handleClose = () => {
    setStep('form')
    setError(null)
    reset()
    modal.close()
  }

  const onSubmit = async (data: TransferFormData) => {
    if (step === 'form') {
      setStep('confirm')
      return
    }

    setError(null)
    
    startTransition(async () => {
      try {
        const result = await transferClient({
          clientId: client.id,
          toUserId: data.toUserId,
          reason: data.reason,
          notifyNewAgent: data.notifyNewAgent
        })

        if (result.success) {
          setStep('success')
          toast.success('Cliente transferido com sucesso!')
          
          setTimeout(() => {
            handleClose()
            onSuccess?.()
          }, 2000)
        } else {
          setError(result.error || 'Erro ao transferir cliente')
          setStep('form')
        }
      } catch (error) {
        setError('Erro ao transferir cliente')
        setStep('form')
      }
    })
  }

  const renderFormStep = () => (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cliente</h3>
        <div className={styles.clientInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Nome:</span>
            <span className={styles.infoValue}>{client.name}</span>
          </div>
          {client.email && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{client.email}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Responsável Atual:</span>
            <span className={styles.infoValue}>
              {currentUser?.name || 'Não atribuído'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.section}>
        <Label htmlFor="toUserId" className={styles.label}>
          <UserIcon className={styles.labelIcon} />
          Novo Responsável
        </Label>
        <Select
          id="toUserId"
          {...register('toUserId')}
          className={styles.select}
          error={errors.toUserId?.message}
        >
          <option value="">Selecione um usuário</option>
          {availableUsers.length === 0 ? (
            <option disabled>Nenhum usuário disponível</option>
          ) : (
            availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email} ({user.role})
              </option>
            ))
          )}
        </Select>
      </div>

      <div className={styles.section}>
        <Label htmlFor="reason" className={styles.label}>
          Justificativa
        </Label>
        <Textarea
          id="reason"
          {...register('reason')}
          className={styles.textarea}
          placeholder="Explique o motivo da transferência..."
          error={errors.reason?.message}
        />
        <span className={styles.charCount}>
          {watchedReason.length}/20 caracteres mínimos
        </span>
      </div>

      <div className={styles.checkboxField}>
        <Checkbox
          id="notifyNewAgent"
          {...register('notifyNewAgent')}
          className={styles.checkbox}
        />
        <Label htmlFor="notifyNewAgent" className={styles.checkboxLabel}>
          Notificar o novo responsável por email
        </Label>
      </div>
    </form>
  )

  const renderConfirmStep = () => (
    <div className={styles.confirmation}>
      <div className={styles.confirmationIcon}>
        <AlertTriangle className={styles.warningIcon} />
      </div>

      <h2 className={styles.confirmationTitle}>Confirmar Transferência</h2>
      <p className={styles.confirmationText}>
        Você está prestes a transferir este cliente. Esta ação será registrada no histórico.
      </p>

      <div className={styles.transferPreview}>
        <div className={styles.transferCard}>
          <div className={styles.transferFrom}>
            <span className={styles.transferLabel}>De</span>
            <div className={styles.userCard}>
              <span className={styles.userCardName}>{currentUser?.name}</span>
              <span className={styles.userCardEmail}>{currentUser?.email}</span>
            </div>
          </div>

          <ArrowRight className={styles.transferArrow} />

          <div className={styles.transferTo}>
            <span className={styles.transferLabel}>Para</span>
            <div className={styles.userCard}>
              <span className={styles.userCardName}>{selectedUser?.name}</span>
              <span className={styles.userCardEmail}>{selectedUser?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.reasonPreview}>
        <p className={styles.reasonLabel}>Justificativa</p>
        <p className={styles.reasonText}>{watchedReason}</p>
      </div>

      {watchedNotify && (
        <div className={styles.notificationInfo}>
          <span>O novo responsável será notificado por email</span>
        </div>
      )}
    </div>
  )

  const renderSuccessStep = () => (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <CheckCircle className={styles.checkIcon} />
      </div>

      <h2 className={styles.successTitle}>Cliente Transferido!</h2>
      <p className={styles.successText}>
        O cliente {client.name} foi transferido com sucesso para {selectedUser?.name}.
      </p>
      
      {watchedNotify && (
        <p className={styles.successNotification}>
          Uma notificação foi enviada para o novo responsável.
        </p>
      )}
    </div>
  )

  return (
    <>
      <span onClick={modal.open}>{children}</span>
      
      <FormModal
        isOpen={modal.isOpen}
        onClose={handleClose}
        title={
          step === 'form' ? 'Transferir Cliente' :
          step === 'confirm' ? 'Confirmar Transferência' :
          'Transferência Concluída'
        }
        className={styles.modal}
        showFooter={step !== 'success'}
        onSubmit={step === 'form' ? handleSubmit(onSubmit) : step === 'confirm' ? handleSubmit(onSubmit) : undefined}
        submitLabel={step === 'form' ? 'Continuar' : 'Confirmar Transferência'}
        cancelLabel={step === 'form' ? 'Cancelar' : 'Voltar'}
        onCancel={step === 'confirm' ? () => setStep('form') : undefined}
        submitDisabled={
          step === 'form' ? (!watchedToUserId || watchedReason.length < 20) : false
        }
        isSubmitting={isPending}
        submitVariant={step === 'confirm' ? 'destructive' : 'default'}
      >
        {step === 'form' && renderFormStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
      </FormModal>
    </>
  )
}