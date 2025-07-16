"use client"

import React from 'react';
import { Label } from '@/components/ui/label';
import styles from './form.module.css';

interface FormProps {
  children: React.ReactNode;
  className?: string;
}

interface FormFieldProps {
  control?: any;
  name: string;
  render: ({ field }: { field: any }) => React.ReactElement;
}

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface FormControlProps {
  children: React.ReactNode;
}

interface FormDescriptionProps {
  children: React.ReactNode;
}

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

// Simple wrapper that doesn't interfere with react-hook-form
const Form = ({ children, className }: FormProps) => {
  return <div className={className}>{children}</div>;
};

const FormField = ({ 
  control, 
  name, 
  render 
}: FormFieldProps) => {
  // This should be handled by the parent component using react-hook-form properly
  return <div>{render({ field: { name, value: '', onChange: () => {}, onBlur: () => {} } })}</div>;
};

const FormItem = ({ children, className }: FormItemProps) => {
  return <div className={`${styles.formItem} ${className || ''}`}>{children}</div>;
};

const FormLabel = ({ children, className }: FormLabelProps) => {
  return <Label className={`${styles.formLabel} ${className || ''}`}>{children}</Label>;
};

const FormControl = ({ children }: FormControlProps) => {
  return <div className={styles.formControl}>{children}</div>;
};

const FormDescription = ({ children }: FormDescriptionProps) => {
  return <p className={styles.formDescription}>{children}</p>;
};

const FormMessage = ({ children, className }: FormMessageProps) => {
  if (!children) return null;
  return <p className={`${styles.formMessage} ${className || ''}`}>{children}</p>;
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
