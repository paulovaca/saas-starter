// Re-export all queries from the new modular structure
export * from './queries/auth';
export * from './queries/agency'; 
export * from './queries/activity';
export * from './queries/clients';

// Re-export cached queries for better performance
export * from './cached-queries';
