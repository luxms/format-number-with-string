import type { IFormatterOptions, IFormatOverrideOptions, IFormattedResult, RoundingDirection } from './types';
import { isFiniteNumber } from './utils';

/** Внутренние разрешённые опции после применения значений по умолчанию */
interface IResolvedOptions {
  negativeType: string;
  negativeLeftSymbol: string;
  negativeRightSymbol: string;
  negativeLeftOut: boolean;
  negativeRightOut: boolean;
  prefix: string;
  suffix: string;
  integerSeparator: string;
  decimalsSeparator: string;
  decimal: string;
  padLeft: number;
  padRight: number;
  truncate: number | null;
  round: number | null;
}

/** Функция форматирования с методом unformat */
export interface IFormatFunction {
  (number: unknown, overrideOptions?: IFormatOverrideOptions, rounding?: RoundingDirection, originValue?: unknown): IFormattedResult;
  unformat: (number: string, allowedSeparators?: string[]) => string;
}

/**
 * Создаёт функцию форматирования с заданными опциями.
 * Возвращённая функция форматирует числа согласно настроенным правилам.
 *
 * @param opts - опции форматирования
 * @returns функция форматирования с методом unformat
 */
export function createFormatter(opts: IFormatterOptions): IFormatFunction {
  const options = resolveOptions(opts);

  function format(number: unknown, overrideOptions?: IFormatOverrideOptions, rounding?: RoundingDirection, originValue?: unknown): IFormattedResult {
    const override = overrideOptions || {};

    if (number || number === 0) {
      number = '' + number;
    } else {
      return createResult('', '', '', '');
    }

    let numStr = number as string;

    // Определяем и убираем знак минуса
    const isNegative = numStr.charAt(0) === '-';
    numStr = numStr.replace(/^-/g, '');

    // Собираем части вывода
    const output: string[] = [];
    const valueParts: string[] = [];
    const prefixParts: string[] = [];
    const suffixParts: string[] = [];

    // Левая сторона: символ знака и/или префикс
    if (!options.negativeLeftOut && !override.noUnits) {
      output.push(options.prefix);
      prefixParts.push(options.prefix);
    }
    if (isNegative) {
      output.push(options.negativeLeftSymbol);
      valueParts.push(options.negativeLeftSymbol);
    }
    if (options.negativeLeftOut && !override.noUnits) {
      output.push(options.prefix);
      prefixParts.push(options.prefix);
    }

    // Форматирование основного числа
    const parts = numStr.split('.');
    if (options.round != null) roundNumber(parts, options.round, rounding);
    if (options.truncate != null) parts[1] = truncate(parts[1], options.truncate);
    if (options.padLeft > 0) parts[0] = padLeft(parts[0], options.padLeft);
    if (options.padRight > 0) parts[1] = padRight(parts[1], options.padRight);
    if (!override.noSeparator && parts[1]) parts[1] = addDecimalSeparators(parts[1], options.decimalsSeparator);
    if (!override.noSeparator && parts[0]) parts[0] = addIntegerSeparators(parts[0], options.integerSeparator);

    if (!isFiniteNumber(originValue)) {
      // Нечисловое значение: показываем прочерк, без дробной части
      output.push('-');
      valueParts.push('');
    } else {
      output.push(parts[0]);
      valueParts.push(parts[0]);
    }

    if (isFiniteNumber(originValue) && parts[1]) {
      output.push(options.decimal);
      output.push(parts[1]);
      valueParts.push(options.decimal);
      valueParts.push(parts[1]);
    }

    // Правая сторона: суффикс и/или символ знака
    if (options.negativeRightOut && !override.noUnits) {
      output.push(options.suffix);
      suffixParts.push(options.suffix);
    }
    if (isNegative) {
      output.push(options.negativeRightSymbol);
      valueParts.push(options.negativeRightSymbol);
    }
    if (!options.negativeRightOut && !override.noUnits) {
      output.push(options.suffix);
      suffixParts.push(options.suffix);
    }

    return createResult(output.join(''), valueParts.join(''), prefixParts.join(''), suffixParts.join(''));
  }

  /**
   * Удаляет форматирование из строки числа (убирает префикс, суффикс и разделители).
   *
   * @param number - отформатированная строка числа
   * @param allowedSeparators - дополнительные разделители для удаления
   * @returns очищенная строка числа
   */
  function unformat(number: string, allowedSeparators?: string[]): string {
    const separators = [...(allowedSeparators || [])];
    if (opts.allowedSeparators) {
      separators.push(...opts.allowedSeparators);
    }
    separators.push(options.integerSeparator);
    separators.push(options.decimalsSeparator);

    let result = number.replace(options.prefix, '').replace(options.suffix, '');
    let prev: string;
    do {
      prev = result;
      for (const sep of separators) {
        result = result.replace(sep, '');
      }
    } while (result !== prev);

    return result;
  }

  format.unformat = unformat;

  return format;
}

// ── Внутренние вспомогательные функции ──

/** Применяет значения по умолчанию к опциям форматирования */
function resolveOptions(opts: IFormatterOptions): IResolvedOptions {
  const negativeType = opts.negativeType || (opts.negative === 'R' ? 'right' : 'left');

  let negativeLeftSymbol: string;
  if (typeof opts.negativeLeftSymbol === 'string') {
    negativeLeftSymbol = opts.negativeLeftSymbol;
  } else {
    negativeLeftSymbol = negativeType === 'left' ? '-' : negativeType === 'brackets' ? '(' : '';
  }

  let negativeRightSymbol: string;
  if (typeof opts.negativeRightSymbol === 'string') {
    negativeRightSymbol = opts.negativeRightSymbol;
  } else {
    negativeRightSymbol = negativeType === 'right' ? '-' : negativeType === 'brackets' ? ')' : '';
  }

  return {
    negativeType,
    negativeLeftSymbol,
    negativeRightSymbol,
    negativeLeftOut: typeof opts.negativeLeftOut === 'boolean' ? opts.negativeLeftOut : opts.negativeOut !== false,
    negativeRightOut: typeof opts.negativeRightOut === 'boolean' ? opts.negativeRightOut : opts.negativeOut !== false,
    prefix: opts.prefix || '',
    suffix: opts.suffix || '',
    integerSeparator: typeof opts.integerSeparator === 'string'
      ? opts.integerSeparator
      : (typeof opts.separator === 'string' ? opts.separator : ','),
    decimalsSeparator: typeof opts.decimalsSeparator === 'string' ? opts.decimalsSeparator : '',
    decimal: opts.decimal || '.',
    padLeft: opts.padLeft || -1,
    padRight: opts.padRight || -1,
    truncate: opts.truncate ?? null,
    round: opts.round ?? null,
  };
}

/** Создаёт объект результата форматирования */
function createResult(full: string, value: string, prefix: string, suffix: string): IFormattedResult {
  const result = new String(full) as IFormattedResult;
  result.value = value;
  result.prefix = prefix;
  result.suffix = suffix;
  return result;
}

/** Добавляет разделители тысяч в целую часть числа */
function addIntegerSeparators(x: string, separator: string): string {
  if (!separator) return x;
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + separator + '$2');
  }
  return x;
}

/** Добавляет разделители тысячных в дробную часть числа */
function addDecimalSeparators(x: string, separator: string): string {
  if (!separator) return x;
  const rgx = /(\d{3})(\d+)/;
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + separator + '$2');
  }
  return x;
}

/** Дополняет целую часть нулями слева до заданной длины */
function padLeft(x: string, padding: number): string {
  const buf: string[] = [];
  while (buf.length + x.length < padding) buf.push('0');
  return buf.join('') + x;
}

/** Дополняет дробную часть нулями справа до заданной длины */
function padRight(x: string | undefined, padding: number): string {
  const str = x || '';
  const buf: string[] = [];
  while (buf.length + str.length < padding) buf.push('0');
  return str + buf.join('');
}

/** Обрезает дробную часть до заданной длины */
function truncate(x: string | undefined, length: number): string | undefined {
  if (x && x.length > length) return x.substr(0, length);
  return x;
}

/**
 * Округляет число, представленное как массив [целая_часть, дробная_часть].
 *
 * @param parts - массив строк: [0] — целая часть, [1] — дробная часть
 * @param places - количество знаков после запятой
 * @param rounding - направление округления ('up' | 'down')
 */
function roundNumber(parts: string[], places: number, rounding?: RoundingDirection): string[] {
  if (!parts[1] || places < 0 || parts[1].length <= places) return parts;

  let decim = parts[1].slice(0, places);
  const nextDigit = +(parts[1].substr(places, 1));

  if ((nextDigit >= 5 && rounding !== 'down') || rounding === 'up') {
    // Сохраняем ведущие нули — преобразование в число их потеряет
    let leadingZeros = '';
    while (decim.charAt(0) === '0') {
      leadingZeros += '0';
      decim = decim.substr(1);
    }

    decim = (+decim + 1) + '';
    decim = leadingZeros + decim;

    if (decim.length > places) {
      // Перенос в целую часть
      parts[0] = (+parts[0] + +decim.charAt(0)) + '';
      decim = decim.substring(1);
    }
  }

  parts[1] = decim;
  return parts;
}
