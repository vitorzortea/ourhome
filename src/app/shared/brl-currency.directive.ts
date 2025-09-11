import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[brlCurrency]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => BrlCurrencyDirective),
  }]
})
export class BrlCurrencyDirective implements ControlValueAccessor {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  private disabled = false;

  /**
   * Representa o valor em CENTAVOS como string só com dígitos (ex.: "1234" = 12,34).
   * Mantemos no estado para conseguir mapear cursor entre formatações.
   */
  private digits = '0';

  /** Formatador sem símbolo, usando locale pt-BR e 2 casas decimais. */
  private readonly formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });

  // ==== ControlValueAccessor ====
  writeValue(value: number | string | null): void {
    if (value === null || value === undefined || value === '') {
      this.digits = '0';
    } else {
      const num = typeof value === 'string' ? Number(value) : value;
      const cents = Math.round((Number.isFinite(num) ? (num as number) : 0) * 100);
      this.digits = Math.abs(cents).toString();
    }
    this.render();
  }

  registerOnChange(fn: (value: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.el.disabled = isDisabled;
  }

  // ==== UX: foco/touch ====
  @HostListener('focus')
  onFocus(): void {
    // Ao focar em 0,00, posicione o cursor no fim para digitação de centavos
    // (comportamento mais esperado para campos monetários).
    queueMicrotask(() => this.setCaret(this.el.value.length));
  }

  @HostListener('blur')
  onBlur(): void { this.onTouched(); }

  // ==== Digitação ====
  @HostListener('input', ['$event'])
  onInput(ev: InputEvent): void {
    if (this.disabled) return;

    const raw = this.el.value ?? '';

    // Quantos dígitos existem ANTES do cursor no valor não normalizado
    const caretPos = this.getCaret();
    const digitsBeforeCaret = this.countDigits(raw.slice(0, caretPos));

    // Nova sequência de dígitos (removendo tudo que não é número)
    let nextDigits = raw.replace(/\D+/g, '');

    // Evitar string vazia: manter ao menos '0'
    if (nextDigits.length === 0) nextDigits = '0';

    // Normalizar: remover zeros à esquerda, mantendo 1 zero se tudo for zero
    nextDigits = nextDigits.replace(/^0+(?=\d)/, '');

    this.digits = nextDigits;

    // Re-renderiza formatado e reposiciona o cursor baseado na contagem de dígitos
    const clampedDigitIndex = Math.min(digitsBeforeCaret, this.digits.length);
    this.render(clampedDigitIndex);

    // Propaga o valor numérico para o formulário
    const num = this.getNumberFromDigits(this.digits);
    this.onChange(num);
  }

  // ==== Helpers ====
  private render(targetDigitIndex?: number): void {
    const formatted = this.formatter.format(this.getNumberFromDigits(this.digits));
    this.el.value = formatted;

    if (typeof targetDigitIndex === 'number') {
      const caret = this.mapDigitIndexToCaret(this.el.value, targetDigitIndex);
      // Ajuste assíncrono para não competir com o próprio evento de input
      queueMicrotask(() => this.setCaret(caret));
    }
  }

  private getNumberFromDigits(d: string): number {
    const cents = parseInt(d || '0', 10);
    return cents / 100;
  }

  private countDigits(s: string): number { return (s.match(/\d/g) || []).length; }

  private getCaret(): number {
    // selectionStart é suficiente para inputs text
    return this.el.selectionStart ?? (this.el.value?.length ?? 0);
  }

  private setCaret(pos: number): void {
    try {
      this.el.setSelectionRange(pos, pos);
    } catch {
      // Em alguns contextos (inputs do tipo number) setSelectionRange pode lançar
      // -> Mantemos best-effort sem quebrar.
    }
  }

  /**
   * Converte um índice "de dígitos" para posição de caret no texto com máscara.
   * Ex.: para colocar o caret depois do 3º dígito, percorre a string contando \d.
   */
  private mapDigitIndexToCaret(masked: string, digitIndex: number): number {
    if (digitIndex <= 0) return 0;
    let count = 0;
    for (let i = 0; i < masked.length; i++) {
      if (/\d/.test(masked[i])) {
        count++;
        if (count >= digitIndex) return i + 1;
      }
    }
    return masked.length;
  }
}
