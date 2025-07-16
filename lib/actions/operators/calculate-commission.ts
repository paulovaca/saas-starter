'use server';

import { db } from '@/lib/db/drizzle';
import { operatorItems, commissionRules } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { calculateCommissionSchema, type CalculateCommissionInput } from '@/lib/validations/operators/commission.schema';

export interface CommissionCalculation {
  totalCommission: number;
  appliedRules: Array<{
    ruleId: string;
    ruleType: string;
    appliedValue: number;
    description: string;
  }>;
  details: {
    saleValue: number;
    commissionType: 'percentage' | 'fixed' | 'tiered';
    breakdown: string;
  };
}

export async function calculateCommission(data: CalculateCommissionInput) {
  try {
    const session = await auth();
    if (!session?.user?.agencyId) {
      redirect('/sign-in');
    }

    // Validate input data
    const validatedData = calculateCommissionSchema.parse(data);
    const { operatorItemId, saleValue, paymentMethod, conditions } = validatedData;

    // Get operator item
    const operatorItem = await db
      .select()
      .from(operatorItems)
      .where(eq(operatorItems.id, operatorItemId))
      .limit(1);

    if (operatorItem.length === 0) {
      throw new Error('Item da operadora não encontrado.');
    }

    const item = operatorItem[0];

    // Get commission rules for this item
    const rules = await db
      .select()
      .from(commissionRules)
      .where(eq(commissionRules.operatorItemId, operatorItemId));

    if (rules.length === 0) {
      throw new Error('Nenhuma regra de comissão configurada para este item.');
    }

    let totalCommission = 0;
    const appliedRules: CommissionCalculation['appliedRules'] = [];

    // Apply commission rules based on type
    for (const rule of rules) {
      let appliedValue = 0;
      let description = '';
      let shouldApply = true;

      // Check conditions if they exist
      if (rule.conditions && Object.keys(rule.conditions).length > 0) {
        const ruleConditions = rule.conditions as Record<string, any>;
        
        // Check payment method condition
        if (ruleConditions.paymentMethod && paymentMethod) {
          shouldApply = ruleConditions.paymentMethod === paymentMethod;
        }

        // Check other conditions
        if (conditions && ruleConditions.customConditions) {
          for (const [key, value] of Object.entries(ruleConditions.customConditions)) {
            if (conditions[key] !== value) {
              shouldApply = false;
              break;
            }
          }
        }
      }

      if (!shouldApply) {
        continue;
      }

      // Apply rule based on type
      switch (rule.ruleType) {
        case 'default':
          if (rule.percentage) {
            appliedValue = saleValue * (rule.percentage / 100);
            description = `${rule.percentage}% sobre R$ ${saleValue.toFixed(2)}`;
          } else if (rule.fixedValue) {
            appliedValue = rule.fixedValue;
            description = `Valor fixo de R$ ${rule.fixedValue.toFixed(2)}`;
          }
          break;

        case 'tiered':
          if (rule.minValue !== null && rule.maxValue !== null) {
            if (saleValue >= rule.minValue && saleValue <= rule.maxValue) {
              if (rule.percentage) {
                appliedValue = saleValue * (rule.percentage / 100);
                description = `${rule.percentage}% (faixa R$ ${rule.minValue} - R$ ${rule.maxValue})`;
              } else if (rule.fixedValue) {
                appliedValue = rule.fixedValue;
                description = `R$ ${rule.fixedValue.toFixed(2)} (faixa R$ ${rule.minValue} - R$ ${rule.maxValue})`;
              }
            }
          }
          break;

        case 'conditional':
          // Additional conditional logic can be implemented here
          if (rule.percentage) {
            appliedValue = saleValue * (rule.percentage / 100);
            description = `${rule.percentage}% (condicional)`;
          } else if (rule.fixedValue) {
            appliedValue = rule.fixedValue;
            description = `R$ ${rule.fixedValue.toFixed(2)} (condicional)`;
          }
          break;
      }

      if (appliedValue > 0) {
        totalCommission += appliedValue;
        appliedRules.push({
          ruleId: rule.id,
          ruleType: rule.ruleType,
          appliedValue,
          description,
        });
      }
    }

    const calculation: CommissionCalculation = {
      totalCommission,
      appliedRules,
      details: {
        saleValue,
        commissionType: item.commissionType,
        breakdown: `Valor da venda: R$ ${saleValue.toFixed(2)} | Comissão total: R$ ${totalCommission.toFixed(2)}`,
      },
    };

    return {
      success: true,
      data: calculation,
    };
  } catch (error) {
    console.error('Error calculating commission:', error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
    };
  }
}
