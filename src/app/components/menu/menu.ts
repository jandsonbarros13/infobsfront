// src/app/components/menu/menu.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faCheck, faSearch, faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  standalone: true,
  // Adicione NgOptimizedImage ao array de imports
  imports: [CommonModule, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent {
  // --- Inputs ---
  @Input() lancamentosSelecionadosCount: number = 0;
  @Input() mostrarFiltros: boolean = false;

  // --- Outputs (Eventos para o componente pai) ---
  @Output() cadastrarAlunoClick = new EventEmitter<void>();
  @Output() confirmarSelecionadosClick = new EventEmitter<void>();
  @Output() toggleFiltrosClick = new EventEmitter<void>();
  @Output() gerarExcelClick = new EventEmitter<void>();
  @Output() gerarPdfClick = new EventEmitter<void>();

  // --- Ícones ---
  faPlus = faPlus;
  faCheck = faCheck;
  faSearch = faSearch;
  faFileExcel = faFileExcel;
  faFilePdf = faFilePdf;

  // Propriedade para o caminho da imagem, se quiser que seja dinâmica
  // logoImagePath: string = 'assets/images/logo.png'; // Exemplo de caminho dinâmico

  constructor() { }

  // Métodos que disparam os eventos para o componente pai
  onCadastrarAluno(): void {
    this.cadastrarAlunoClick.emit();
  }

  onConfirmarSelecionados(): void {
    this.confirmarSelecionadosClick.emit();
  }

  onToggleFiltros(): void {
    this.toggleFiltrosClick.emit();
  }

  onGerarExcel(): void {
    this.gerarExcelClick.emit();
  }

  onGerarPdf(): void {
    this.gerarPdfClick.emit();
  }
}