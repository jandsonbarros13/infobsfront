// src/app/services/cliente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model'; // Cliente agora é o modelo de Lançamento

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://localhost:3000/api/clientes'; // Continua apontando para a mesma rota

  constructor(private http: HttpClient) { }

  getClientes(): Observable<Cliente[]> { // Busca uma lista de Lançamentos
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getClienteById(id: string): Observable<Cliente> { // Busca um único Lançamento
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  createCliente(alunoData: { nome: string; vencimento: Date; valorMensalidade: number; status: 'pago' | 'pendente' | 'vencido'; quantidadeParcelas: number; }): Observable<Cliente[]> {
    return this.http.post<Cliente[]>(this.apiUrl, alunoData);
  }

  updateCliente(id: string, lancamento: Cliente): Observable<Cliente> { // Atualiza um Lançamento
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, lancamento);
  }

  deleteCliente(id: string): Observable<void> { // Deleta um Lançamento
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODO AJUSTADO: gerarPdfRelatorio para chamar o backend com filtros ---
  gerarPdfRelatorio(filtros?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filtros) {
      // Adiciona cada filtro como um query parameter se ele tiver um valor
      for (const key in filtros) {
        if (filtros.hasOwnProperty(key) && filtros[key] !== null && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      }
    }

    // Envia os parâmetros na requisição GET
    return this.http.get(`${this.apiUrl}/relatorio/pdf`, {
      responseType: 'blob',
      params: params // Adiciona os parâmetros aqui
    });
  }
  // --- FIM DO MÉTODO AJUSTADO ---
}