const validationFieldLabels = {
  nome: 'Nome',
  cpfCnpj: 'CPF/CNPJ',
  email: 'E-mail',
  telefone: 'Telefone',
  cep: 'CEP',
  endereco: 'Endereço',
  cidade: 'Cidade',
  estado: 'Estado',
  observacoes: 'Observações',
  ativo: 'Status',
};

export const getApiErrorMessage = (error, fallback) => {
  const response = error?.response?.data;
  const apiError = response?.error;

  if (apiError?.code === 'VALIDATION_ERROR' && Array.isArray(apiError.details)) {
    const messages = apiError.details
      .filter((detail) => detail && typeof detail.message === 'string')
      .map((detail) => {
        const label = validationFieldLabels[detail.field];
        return label ? `${label}: ${detail.message}` : detail.message;
      });

    if (messages.length > 0) return [...new Set(messages)].join(' · ');
  }

  if (error?.response?.status === 401) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }

  return apiError?.message || response?.message || fallback;
};
