// src/app/models/cliente.model.ts

// A interface Cliente agora representa um Lançamento individual
export interface Cliente {
  _id?: string;
  nome: string;
  vencimento: Date;
  valorMensalidade: number;
  status: 'pago' | 'pendente' | 'vencido';
  numeroParcela?: number; // <--- NOVO CAMPO: Opcional, pois só existe após o POST
  createdAt?: Date;
  updatedAt?: Date;
}