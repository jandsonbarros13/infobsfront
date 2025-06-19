// src/app/app.ts
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faCheck,
  faSearch,
  faFileExcel,
  faFilePdf,
  faPencilAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import { Cliente } from './models/cliente.model';
import { ClienteFormComponent } from './components/cliente-form/cliente-form';
import { MenuComponent } from './components/menu/menu';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ClienteService } from './services/cliente'; // Certifique-se de que o caminho está correto: ./services/cliente.service ou ./services/cliente

interface ItemMensalidadeExibicao {
  _id: string;
  nome: string;
  dataReferencia: Date;
  valor: number;
  status: 'pago' | 'pendente' | 'vencido';
  selecionado?: boolean;
  numeroParcela?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    FontAwesomeModule,
    ClienteFormComponent,
    MenuComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  title = 'front';

  // Caminhos das imagens: ajuste se elas estiverem na pasta 'assets' ou em outro lugar.
  // Se for 'assets', o caminho seria 'assets/newLogo.jpg'
  appLogoUrl: string = '/public/newLogo.jpg';
  userProfilePhoto: string = '/public/newLogo.jpg';
  userType: 'master' | 'Extrusor' | 'outros' = 'master';
  cargo: string = 'Master';

  lancamentos: Cliente[] = [];
  itensMensalidadeExibicao: ItemMensalidadeExibicao[] = [];
  paginatedItems: ItemMensalidadeExibicao[] = [];

  mostrarFormulario: boolean = false;
  lancamentoParaEditar: Cliente | null = null;

  mostrarFiltros: boolean = false;
  faPlus = faPlus;
  faCheck = faCheck;
  faSearch = faSearch;
  faFileExcel = faFileExcel;
  faFilePdf = faFilePdf;
  faPencilAlt = faPencilAlt;
  faTrashAlt = faTrashAlt;

  filtroNome: string = '';
  filtroStatus: '' | 'pago' | 'pendente' | 'vencido' = '';

  filtroMesVencimento: number | null;
  filtroAnoVencimento: number | null;

  filtroDataInicio: string = '';
  filtroDataFim: string = '';

  lancamentosSelecionadosIds: string[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(
    private clienteService: ClienteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const hoje = new Date();
    this.filtroMesVencimento = hoje.getMonth() + 1;
    this.filtroAnoVencimento = hoje.getFullYear();

    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    this.filtroDataInicio = this.formatDateForInput(primeiroDiaMes);
    this.filtroDataFim = this.formatDateForInput(ultimoDiaMes);
  }

  ngOnInit(): void {
    this.carregarLancamentos();
  }

  carregarLancamentos(): void {
    console.log('Recarregando lançamentos...');
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.lancamentos = data.map((lancamento) => ({
          ...lancamento,
          vencimento: new Date(lancamento.vencimento),
        }));
        console.log('Lançamentos carregados:', this.lancamentos);
        this.aplicarFiltros();
      },
      error: (err: any) => {
        console.error('Erro ao carregar lançamentos:', err);
        alert('Erro ao carregar lançamentos. Verifique o console do navegador.');
      },
    });
  }

  aplicarFiltros(): void {
    let lancamentosFiltrados: ItemMensalidadeExibicao[] = this.lancamentos.map((lancamento) => ({
      _id: lancamento._id!,
      nome: lancamento.nome,
      dataReferencia: lancamento.vencimento,
      valor: lancamento.valorMensalidade,
      status: lancamento.status,
      selecionado: this.lancamentosSelecionadosIds.includes(lancamento._id!),
      numeroParcela: lancamento.numeroParcela,
    }));

    if (this.filtroNome) {
      lancamentosFiltrados = lancamentosFiltrados.filter((item) =>
        item.nome.toLowerCase().includes(this.filtroNome.toLowerCase())
      );
    }

    if (this.filtroStatus) {
      lancamentosFiltrados = lancamentosFiltrados.filter(
        (item) => item.status === this.filtroStatus
      );
    }

    const hasDateRangeFilter = this.filtroDataInicio && this.filtroDataFim;
    const hasMonthYearFilter = this.filtroMesVencimento !== null || this.filtroAnoVencimento !== null;

    if (hasDateRangeFilter) {
      const dataInicio = new Date(this.filtroDataInicio);
      const dataFim = new Date(this.filtroDataFim);
      dataFim.setHours(23, 59, 59, 999);

      lancamentosFiltrados = lancamentosFiltrados.filter((item) => {
        const itemDate = item.dataReferencia;
        return itemDate >= dataInicio && itemDate <= dataFim;
      });
    } else if (hasMonthYearFilter) {
      if (this.filtroMesVencimento !== null) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          (item) => item.dataReferencia.getMonth() + 1 === this.filtroMesVencimento
        );
      }

      if (this.filtroAnoVencimento !== null) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          (item) => item.dataReferencia.getFullYear() === this.filtroAnoVencimento
        );
      }
    }

    this.itensMensalidadeExibicao = lancamentosFiltrados.sort((a, b) => {
      const dataA = a.dataReferencia.getTime();
      const dataB = b.dataReferencia.getTime();
      if (dataA !== dataB) {
        return dataA - dataB;
      }
      if (a.nome < b.nome) return -1;
      if (a.nome > b.nome) return 1;
      if (a.numeroParcela !== undefined && b.numeroParcela !== undefined) {
        return a.numeroParcela - b.numeroParcela;
      }
      return 0;
    });

    this.totalPages = Math.ceil(
      this.itensMensalidadeExibicao.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedItems = this.itensMensalidadeExibicao.slice(
      startIndex,
      endIndex
    );
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.filtroStatus = '';
    this.filtroMesVencimento = null;
    this.filtroAnoVencimento = null;
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.currentPage = 1;
    this.aplicarFiltros();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  onCadastrarAlunoAction(): void {
    this.abrirFormularioCadastro();
  }

  onConfirmarSelecionadosAction(): void {
    this.confirmarSelecionados();
  }

  onToggleFiltrosAction(): void {
    this.toggleFiltros();
  }

  onGerarExcelAction(): void {
    if (isPlatformBrowser(this.platformId)) {
      alert('Gerando Excel... Verifique os downloads.');
      console.log('Gerando Excel para lançamentos:', this.itensMensalidadeExibicao);

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
        this.itensMensalidadeExibicao.map((item) => ({
          Nome: item.nome,
          Vencimento: this.formatarData(item.dataReferencia),
          Valor: item.valor.toFixed(2),
          Status: item.status.toUpperCase(),
          Parcela: item.numeroParcela !== undefined ? item.numeroParcela : '',
        }))
      );

      const workbook: XLSX.WorkBook = {
        Sheets: { Lançamentos: worksheet },
        SheetNames: ['Lançamentos'],
      };
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      const data: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      });
      saveAs(data, 'relatorio_lancamentos.xlsx');

      alert('Excel gerado e baixado com sucesso!');
    } else {
      console.warn('Geração de Excel não disponível no ambiente de servidor (SSR).');
    }
  }

  onGerarPdfAction(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Solicitando PDF ao backend com filtros.');

      const filtrosAtuais = {
        nome: this.filtroNome,
        status: this.filtroStatus,
        mesVencimento: this.filtroMesVencimento,
        anoVencimento: this.filtroAnoVencimento,
        dataInicio: this.filtroDataInicio,
        dataFim: this.filtroDataFim,
      };

      this.clienteService.gerarPdfRelatorio(filtrosAtuais).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';

          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          alert('PDF gerado e aberto em nova aba com sucesso!');
        },
        error: (err: any) => {
          console.error('Erro ao gerar PDF pelo backend:', err);
          alert(
            'Erro ao gerar PDF. Verifique o console do navegador e o backend.'
          );
        },
      });
    } else {
      console.warn('Geração de PDF não disponível no ambiente de servidor (SSR).');
    }
  }

  abrirFormularioCadastro(): void {
    this.lancamentoParaEditar = null;
    this.mostrarFormulario = true;
  }

  editarLancamento(item: ItemMensalidadeExibicao): void {
    const lancamentoOriginal = this.lancamentos.find((l) => l._id === item._id);
    if (lancamentoOriginal) {
      this.lancamentoParaEditar = { ...lancamentoOriginal };
      this.mostrarFormulario = true;
    }
  }

  onClienteSalvo(lancamentosSalvos: Cliente[]): void {
    this.mostrarFormulario = false;
    this.lancamentosSelecionadosIds = [];
    this.carregarLancamentos();
    // Adicionado reload aqui (apenas no navegador)
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  onCancelarFormulario(): void {
    this.mostrarFormulario = false;
  }

  toggleSelecao(item: ItemMensalidadeExibicao): void {
    if (!item._id) return;

    const index = this.lancamentosSelecionadosIds.indexOf(item._id);
    if (index > -1) {
      this.lancamentosSelecionadosIds.splice(index, 1);
      item.selecionado = false;
    } else {
      this.lancamentosSelecionadosIds.push(item._id);
      item.selecionado = true;
    }
    console.log('Lançamentos selecionados:', this.lancamentosSelecionadosIds);
  }

  async confirmarSelecionados(): Promise<void> {
    if (this.lancamentosSelecionadosIds.length === 0) {
      alert('Nenhum lançamento selecionado para confirmar.');
      return;
    }

    const confirmAction = confirm(
      `Deseja alterar o status de ${this.lancamentosSelecionadosIds.length} lançamento(s) selecionado(s)?`
    );
    if (!confirmAction) {
      return;
    }

    const updatesPromises: Promise<any>[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (const id of this.lancamentosSelecionadosIds) {
      const lancamento = this.lancamentos.find((l) => l._id === id);
      if (lancamento && lancamento._id) {
        let novoStatus: Cliente['status'];

        if (lancamento.status === 'pago') {
          const vencimentoLancamento = new Date(lancamento.vencimento);
          vencimentoLancamento.setHours(0, 0, 0, 0);
          novoStatus =
            vencimentoLancamento.getTime() > hoje.getTime() ? 'pendente' : 'vencido';
        } else {
          novoStatus = 'pago';
        }

        const lancamentoAtualizado = { ...lancamento, status: novoStatus };
        updatesPromises.push(
          this.clienteService.updateCliente(lancamento._id, lancamentoAtualizado).toPromise()
        );
      }
    }

    try {
      await Promise.all(updatesPromises);
      alert('Status dos lançamentos selecionados atualizados com sucesso!');
      this.lancamentosSelecionadosIds = [];
      this.carregarLancamentos();
      // Adicionado reload aqui (apenas no navegador)
      if (isPlatformBrowser(this.platformId)) {
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status dos lançamentos selecionados:', error);
      alert(
        'Ocorreu um erro ao atualizar o status de um ou mais lançamentos. Verifique o console.'
      );
    }
  }

  deletarLancamento(item: ItemMensalidadeExibicao): void {
    if (!item._id) {
      alert('ID do lançamento não encontrado para exclusão.');
      return;
    }
    if (confirm('Tem certeza que deseja deletar este lançamento permanentemente?')) {
      this.clienteService.deleteCliente(item._id).subscribe({
        next: () => {
          alert('Lançamento deletado com sucesso!');
          this.lancamentosSelecionadosIds = this.lancamentosSelecionadosIds.filter(
            (id) => id !== item._id
          );
          this.carregarLancamentos();
          // Adicionado reload aqui (apenas no navegador)
          if (isPlatformBrowser(this.platformId)) {
            window.location.reload();
          }
        },
        error: (err: any) => {
          console.error('Erro ao deletar lançamento:', err);
          alert(
            'Erro ao deletar lançamento: ' +
              (err.error?.message || 'Verifique o console para mais detalhes.')
          );
        },
      });
    }
  }

  formatarData(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarFiltros();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.aplicarFiltros();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.aplicarFiltros();
    }
  }
}