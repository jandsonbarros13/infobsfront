// src/app/services/cliente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

// Definir a interface para a resposta paginada
interface PaginatedResponse {
  data: Cliente[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'https://infobs-back-vujs.vercel.app/api/clientes';

  constructor(private http: HttpClient) { }

  // Modificado para aceitar parâmetros de paginação e filtros
  getClientes(page: number, limit: number, filtros?: any): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filtros) {
      for (const key in filtros) {
        if (filtros.hasOwnProperty(key) && filtros[key] !== null && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      }
    }
    return this.http.get<PaginatedResponse>(this.apiUrl, { params: params });
  }

  getClienteById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  createCliente(alunoData: { nome: string; vencimento: Date; valorMensalidade: number; status: 'pago' | 'pendente' | 'vencido'; quantidadeParcelas: number; }): Observable<Cliente[]> {
    return this.http.post<Cliente[]>(this.apiUrl, alunoData);
  }

  updateCliente(id: string, lancamento: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, lancamento);
  }

  deleteCliente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  gerarPdfRelatorio(filtros?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filtros) {
      for (const key in filtros) {
        if (filtros.hasOwnProperty(key) && filtros[key] !== null && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      }
    }
    return this.http.get(`${this.apiUrl}/relatorio/pdf`, {
      responseType: 'blob',
      params: params
    });
  }
}
