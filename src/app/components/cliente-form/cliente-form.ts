// src/app/components/cliente-form/cliente-form.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../../models/cliente.model'; // Cliente agora é o modelo de Lançamento
import { ClienteService } from '../../services/cliente';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css'
})
export class ClienteFormComponent implements OnInit {
  // @Input: Recebe o lançamento a ser editado (ou null para novo cadastro)
  @Input() lancamentoParaEdicao: Cliente | null = null; // <-- Nome CORRIGIDO e sincronizado com o HTML

  // @Output: Emite um array de Clientes (lançamentos) quando o formulário é salvo
  @Output() clienteSalvo = new EventEmitter<Cliente[]>();
  // @Output: Emite um evento quando o formulário é cancelado
  @Output() cancelar = new EventEmitter<void>();

  // `novoCliente` representa os dados do formulário. Inclui `quantidadeParcelas` opcionalmente para novos cadastros.
  novoCliente: Cliente & { quantidadeParcelas?: number } = {
    nome: '',
    vencimento: new Date(),
    valorMensalidade: 0,
    status: 'pendente',
    quantidadeParcelas: 1 // Valor padrão para novos cadastros
  };

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    // Se um lançamento foi passado para edição, preenche o formulário
    if (this.lancamentoParaEdicao) {
      this.novoCliente = {
        ...this.lancamentoParaEdicao, // Copia os dados do lançamento existente
        vencimento: this.lancamentoParaEdicao.vencimento ? new Date(this.lancamentoParaEdicao.vencimento) : new Date(),
        quantidadeParcelas: undefined // Quantidade de parcelas não se aplica na edição de um lançamento individual
      };
    } else {
      // Para novo cadastro, garante valores iniciais limpos
      this.novoCliente = {
        nome: '',
        vencimento: new Date(),
        valorMensalidade: 0,
        status: 'pendente',
        quantidadeParcelas: 1
      };
    }
  }

  // Lida com a mudança da data no input de vencimento
  onVencimentoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateString = target.value;
    if (dateString) {
      this.novoCliente.vencimento = new Date(dateString);
    } else {
      this.novoCliente.vencimento = new Date();
    }
  }

  // Salva (cria ou atualiza) o(s) lançamento(s)
  salvarCliente(): void {
    if (this.novoCliente._id) {
      // MODO DE EDIÇÃO: Atualiza um lançamento existente
      this.clienteService.updateCliente(this.novoCliente._id, this.novoCliente).subscribe({
        next: (data) => {
          alert('Lançamento atualizado com sucesso!');
          this.clienteSalvo.emit([data]); // Emite um array com o lançamento atualizado
        },
        error: (err) => {
          console.error('Erro ao atualizar lançamento:', err);
          alert('Erro ao atualizar lançamento: ' + (err.error?.message || 'Verifique o console para mais detalhes.'));
        }
      });
    } else {
      // MODO DE CADASTRO: Cria múltiplos lançamentos (com base na quantidadeParcelas)
      if (this.novoCliente.quantidadeParcelas === undefined || this.novoCliente.quantidadeParcelas < 1) {
        alert('Quantidade de parcelas é obrigatória para um novo cadastro.');
        return;
      }

      // Prepara os dados para enviar ao backend (o backend espera `quantidadeParcelas`)
      const dataToCreate = {
        nome: this.novoCliente.nome,
        vencimento: this.novoCliente.vencimento,
        valorMensalidade: this.novoCliente.valorMensalidade,
        status: this.novoCliente.status,
        quantidadeParcelas: this.novoCliente.quantidadeParcelas
      };

      this.clienteService.createCliente(dataToCreate).subscribe({
        next: (data) => { // `data` é um ARRAY de lançamentos retornados pelo backend
          alert(`Foram cadastrados ${data.length} lançamentos com sucesso!`);
          this.clienteSalvo.emit(data); // Emite o array de lançamentos criados
        },
        error: (err) => {
          console.error('Erro ao cadastrar lançamentos:', err);
          alert('Erro ao cadastrar lançamentos: ' + (err.error?.message || 'Verifique o console para mais detalhes.'));
        }
      });
    }
  }

  // Cancela a operação e fecha o formulário
  cancelarFormulario(): void {
    this.cancelar.emit();
  }
}