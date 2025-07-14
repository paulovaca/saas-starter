import { handleDatabaseError, isPostgresError, getPostgresErrorCategory } from '../../../lib/services/error-handler/database-errors';
import { AppError, ValidationError, DatabaseError } from '../../../lib/services/error-handler';

describe('Database Error Handler', () => {
  describe('handleDatabaseError', () => {
    it('should handle unique constraint violation with email field', () => {
      const postgresError = {
        code: '23505',
        detail: 'Key (email)=(test@example.com) already exists.',
        message: 'duplicate key value violates unique constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Este e-mail já está cadastrado.');
      expect((result as ValidationError).field).toBe('email');
    });

    it('should handle unique constraint violation with CPF field', () => {
      const postgresError = {
        code: '23505',
        detail: 'Key (cpf)=(12345678901) already exists.',
        message: 'duplicate key value violates unique constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Este CPF já está cadastrado.');
      expect((result as ValidationError).field).toBe('cpf');
    });

    it('should handle unique constraint violation with generic field', () => {
      const postgresError = {
        code: '23505',
        detail: 'Key (custom_field)=(value) already exists.',
        message: 'duplicate key value violates unique constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('custom_field já está em uso.');
      expect((result as ValidationError).field).toBe('custom_field');
    });

    it('should handle NOT NULL violation', () => {
      const postgresError = {
        code: '23502',
        column: 'email',
        message: 'null value in column "email" violates not-null constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('O campo "E-mail" é obrigatório.');
      expect((result as ValidationError).field).toBe('email');
    });

    it('should handle foreign key violation', () => {
      const postgresError = {
        code: '23503',
        detail: 'Key (user_id)=(123) is not present in table "users".',
        message: 'insert or update on table violates foreign key constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Não é possível realizar esta operação pois o registro está sendo usado em "users".');
      expect((result as ValidationError).field).toBe('user_id');
    });

    it('should handle connection errors', () => {
      const postgresError = {
        code: '08006',
        message: 'connection_failure',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Falha na conexão com o banco de dados.');
    });

    it('should handle data exception errors', () => {
      const postgresError = {
        code: '22001',
        message: 'value too long for type character varying(50)',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Um ou mais campos excedem o tamanho máximo permitido.');
    });

    it('should handle query timeout', () => {
      const postgresError = {
        code: '57014',
        message: 'query timeout',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('A operação demorou muito tempo. Tente novamente.');
    });

    it('should handle insufficient resources', () => {
      const postgresError = {
        code: '53100',
        message: 'disk full',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Disco cheio.');
    });

    it('should handle syntax errors', () => {
      const postgresError = {
        code: '42601',
        message: 'syntax error at or near "FROM"',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Erro de sintaxe.');
    });

    it('should handle non-PostgreSQL errors', () => {
      const genericError = new Error('Generic error');

      const result = handleDatabaseError(genericError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro ao processar operação no banco de dados.');
    });

    it('should handle unknown PostgreSQL error codes', () => {
      const unknownError = {
        code: 'XX999',
        message: 'Unknown error',
      };

      const result = handleDatabaseError(unknownError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro inesperado no banco de dados. Tente novamente.');
    });

    it('should handle unique constraint without extractable field info', () => {
      const postgresError = {
        code: '23505',
        detail: 'Invalid format',
        message: 'duplicate key value violates unique constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Este registro já existe no sistema.');
    });

    it('should handle NOT NULL without column info', () => {
      const postgresError = {
        code: '23502',
        message: 'null value violates not-null constraint',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Campos obrigatórios não foram preenchidos.');
    });

    it('should handle foreign key violation without extractable info', () => {
      const postgresError = {
        code: '23503',
        detail: 'Invalid format',
        message: 'foreign key constraint violation',
      };

      const result = handleDatabaseError(postgresError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Este registro está sendo usado em outro lugar e não pode ser removido.');
    });
  });

  describe('isPostgresError', () => {
    it('should return true for PostgreSQL errors', () => {
      const postgresError = {
        code: '23505',
        message: 'duplicate key value',
      };

      expect(isPostgresError(postgresError)).toBe(true);
    });

    it('should return false for non-PostgreSQL errors', () => {
      const genericError = new Error('Generic error');
      expect(isPostgresError(genericError)).toBe(false);
    });

    it('should return false for errors without code', () => {
      const errorWithoutCode = {
        message: 'Error without code',
      };
      expect(isPostgresError(errorWithoutCode)).toBe(false);
    });

    it('should return false for errors with non-string code', () => {
      const errorWithNumberCode = {
        code: 23505,
        message: 'Error with number code',
      };
      expect(isPostgresError(errorWithNumberCode)).toBe(false);
    });

    it('should return false for errors with wrong code length', () => {
      const errorWithWrongCodeLength = {
        code: '235',
        message: 'Error with short code',
      };
      expect(isPostgresError(errorWithWrongCodeLength)).toBe(false);
    });
  });

  describe('getPostgresErrorCategory', () => {
    it('should return correct category for connection errors', () => {
      expect(getPostgresErrorCategory('08006')).toBe('Erro de Conexão');
    });

    it('should return correct category for data errors', () => {
      expect(getPostgresErrorCategory('22001')).toBe('Erro nos Dados');
    });

    it('should return correct category for integrity violations', () => {
      expect(getPostgresErrorCategory('23505')).toBe('Violação de Integridade');
    });

    it('should return correct category for syntax errors', () => {
      expect(getPostgresErrorCategory('42601')).toBe('Erro de Sintaxe ou Acesso');
    });

    it('should return correct category for resource errors', () => {
      expect(getPostgresErrorCategory('53100')).toBe('Recursos Insuficientes');
    });

    it('should return correct category for operator intervention', () => {
      expect(getPostgresErrorCategory('57014')).toBe('Intervenção do Operador');
    });

    it('should return correct category for PL/pgSQL errors', () => {
      expect(getPostgresErrorCategory('P0001')).toBe('Erro de PL/pgSQL');
    });

    it('should return correct category for internal errors', () => {
      expect(getPostgresErrorCategory('XX000')).toBe('Erro Interno');
    });

    it('should return "Erro Desconhecido" for unknown categories', () => {
      expect(getPostgresErrorCategory('ZZ999')).toBe('Erro Desconhecido');
    });
  });

  describe('Field-specific error messages', () => {
    const fieldTests = [
      { field: 'email', expected: 'Este e-mail já está cadastrado.' },
      { field: 'cpf', expected: 'Este CPF já está cadastrado.' },
      { field: 'cnpj', expected: 'Este CNPJ já está cadastrado.' },
      { field: 'phone', expected: 'Este telefone já está cadastrado.' },
      { field: 'name', expected: 'Este nome já está em uso.' },
      { field: 'username', expected: 'Este nome de usuário já está em uso.' },
      { field: 'code', expected: 'Este código já está em uso.' },
      { field: 'slug', expected: 'Este identificador já está em uso.' },
      { field: 'tax_id', expected: 'Este documento já está cadastrado.' },
      { field: 'registration', expected: 'Esta matrícula já está em uso.' },
      { field: 'license', expected: 'Esta licença já está em uso.' },
    ];

    fieldTests.forEach(({ field, expected }) => {
      it(`should return specific message for ${field} field`, () => {
        const postgresError = {
          code: '23505',
          detail: `Key (${field})=(value) already exists.`,
          message: 'duplicate key value violates unique constraint',
        };

        const result = handleDatabaseError(postgresError);

        expect(result).toBeInstanceOf(ValidationError);
        expect(result.message).toBe(expected);
        expect((result as ValidationError).field).toBe(field);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null error', () => {
      const result = handleDatabaseError(null);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro ao processar operação no banco de dados.');
    });

    it('should handle undefined error', () => {
      const result = handleDatabaseError(undefined);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro ao processar operação no banco de dados.');
    });

    it('should handle empty object', () => {
      const result = handleDatabaseError({});
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro ao processar operação no banco de dados.');
    });

    it('should handle error with empty string code', () => {
      const errorWithEmptyCode = {
        code: '',
        message: 'Error with empty code',
      };
      const result = handleDatabaseError(errorWithEmptyCode);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Erro ao processar operação no banco de dados.');
    });
  });
});
