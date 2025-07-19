export function formatDate(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays === -1) {
    return 'Amanhã';
  } else if (diffDays > 0) {
    return `Há ${diffDays} dias`;
  } else {
    return `Em ${Math.abs(diffDays)} dias`;
  }
}
