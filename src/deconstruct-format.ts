import type { IDeconstructedFormat, NegativeType } from './types';

/**
 * Разбирает строку формата числа на составные части.
 *
 * Парсит паттерны вроде "-9,999.90", "(#,##0)", "$+#,###" и т.д.,
 * извлекая тип отрицательного числа, префикс/суффикс, разделители,
 * десятичный символ и правила отступов/округления.
 *
 * @param requiredFormat - строка формата
 * @param value - числовое значение (для определения знака при символе '+')
 * @returns разобранный формат или false при ошибке валидации
 */
export function deconstructFormat(requiredFormat: string | null | undefined, value: number): IDeconstructedFormat | false {
  let format = (requiredFormat || '-9,999.90').trim();

  // ── Определение типа отрицательного числа и извлечение префикса/суффикса ──

  let negativeType: NegativeType = 'left';
  let negativeRightSymbol = '';
  let negativeLeftSymbol = '';
  let negativeRightPos = -1;
  let negativeLeftPos = -1;
  let prefix = '';
  let suffix = '';

  if (/^([^()]+)?[(]([^09#]+)?[09#., ]+([^)]+)?[)](.+)?$/.test(format)) {
    // Скобки как обозначение отрицательного числа: например "(#,##0)"
    negativeType = 'brackets';
    negativeLeftPos = format.indexOf('(');
    negativeLeftSymbol = '(';

    if (negativeLeftPos > 0) {
      prefix = format.slice(0, negativeLeftPos);
    } else {
      const numStart = format.search(/0|9|#/);
      prefix = numStart > 0 ? format.slice(1, numStart) : '';
    }
    format = format.slice(prefix.length + 1);

    negativeRightPos = format.indexOf(')');
    negativeRightSymbol = ')';

    if (negativeRightPos < format.length - 1) {
      suffix = format.slice(negativeRightPos + 1);
      format = format.slice(0, negativeRightPos);
    } else {
      const suffixStart = format.search(/[^09#,.]([^09#](.+)?)?[)]$/);
      suffix = suffixStart > -1 ? format.slice(suffixStart, -1) : '';
      format = format.slice(0, format.length - suffix.length - 1);
      negativeRightPos = 0;
    }

  } else if (format.indexOf('-') === -1) {
    // Только положительные значения
    negativeType = 'none';
    const prefixEnd = format.search(/[.,]?[09#]/);
    prefix = prefixEnd > 0 ? format.slice(0, prefixEnd) : '';
    format = format.slice(prefix.length);
    const suffixStart = format.search(/[^09#,.]([^09#]+|$)/);
    suffix = suffixStart > -1 ? format.slice(suffixStart) : '';
    format = format.slice(0, format.length - suffix.length);

  } else if (/^([^09#-]+)?-.+$/.test(format)) {
    // Знак минуса слева: например "-#,##0" или "$-#,##0"
    negativeType = 'left';
    negativeLeftPos = format.indexOf('-');
    negativeLeftSymbol = '-';

    if (negativeLeftPos > 0) {
      prefix = format.slice(0, negativeLeftPos);
    } else {
      const numStart = format.search(/[09#]/);
      prefix = numStart > 0 ? format.slice(1, numStart) : '';
    }
    format = format.slice(prefix.length + 1);
    const suffixStart = format.search(/[^09#,.]([^09#]+|$)/);
    suffix = suffixStart > -1 ? format.slice(suffixStart) : '';
    format = format.slice(0, format.length - suffix.length);

  } else {
    // Знак минуса справа: например "#,##0-"
    negativeType = 'right';
    const numStart = format.search(/[09#]/);
    prefix = numStart > 0 ? format.slice(0, numStart) : '';
    format = format.slice(prefix.length);
    negativeRightSymbol = '-';
    negativeRightPos = format.lastIndexOf('-');

    if (negativeRightPos < format.length - 1) {
      suffix = format.slice(negativeRightPos + 1);
      format = format.slice(0, negativeRightPos);
    } else {
      const suffixStart = format.search(/[^09#,.]([^09#](.+)?)?-$/);
      suffix = suffixStart > -1 ? format.slice(suffixStart, format.length - 1) : '';
      format = format.slice(0, format.length - suffix.length - 1);
      negativeRightPos = 0;
    }
  }

  // ── Поглощение пробелов, прилегающих к символам знака ──

  // Знак перед префиксом → переносим ведущие пробелы из префикса к символу знака
  while (negativeLeftPos === 0 && prefix && prefix[0] === ' ') {
    negativeLeftSymbol += ' ';
    prefix = prefix.slice(1);
  }

  // Знак после суффикса → переносим завершающие пробелы из суффикса к символу знака
  while (negativeRightPos === 0 && suffix && suffix[suffix.length - 1] === ' ') {
    negativeRightSymbol = ' ' + negativeRightSymbol;
    suffix = suffix.slice(0, -1);
  }

  // Знак после префикса → переносим ведущие пробелы из формата к символу знака
  while (negativeLeftPos > 0 && format.length && format[0] === ' ') {
    negativeLeftSymbol += ' ';
    format = format.slice(1);
  }

  // Знак перед суффиксом → переносим завершающие пробелы из формата к символу знака
  while (negativeRightPos > 0 && format.length && format[format.length - 1] === ' ') {
    negativeRightSymbol = ' ' + negativeRightSymbol;
    format = format.slice(0, -1);
  }

  const absMask = format;

  // ── Определение десятичного символа и разбор целой/дробной части ──

  let decimalChar = '';
  let decimalsPart = '';
  let integerPart = '';
  let decimalsSeparator = '';
  let integerSeparator = '';

  decimalChar = detectDecimalChar(format);

  if (decimalChar && format.indexOf(decimalChar) > -1) {
    decimalsPart = format.slice(format.indexOf(decimalChar) + 1);
    integerPart = format.slice(0, format.indexOf(decimalChar));
  } else {
    integerPart = format;
  }

  // Убираем завершающие символы-разделители из дробной части
  while (decimalsPart.length && /[., ]$/.test(decimalsPart)) {
    decimalsPart = decimalsPart.slice(0, -1);
  }

  // Убираем ведущие символы-разделители из целой части
  while (integerPart.length && /[., ]/.test(integerPart[0])) {
    integerPart = integerPart.slice(1);
  }

  // Извлекаем разделитель тысяч из целой части
  if (integerPart) {
    const sepIdx = integerPart.search(/[., ]/);
    if (sepIdx > 0) {
      integerSeparator = integerPart[sepIdx];
      integerPart = integerPart.replace(/[., ]/g, '');
    }
  }

  // Извлекаем разделитель тысячных из дробной части
  if (decimalsPart) {
    const sepIdx = decimalsPart.search(/[., ]/);
    if (sepIdx > 0) {
      decimalsSeparator = decimalsPart[sepIdx];
      decimalsPart = decimalsPart.replace(/[., ]/g, '');
    }
  }

  // Валидация: части должны содержать только символы формата (0, 9, #)
  if (
    (integerPart.length && !/^[09#]+$/.test(integerPart)) ||
    (decimalsPart.length && !/^[09#]+$/.test(decimalsPart))
  ) {
    return false;
  }

  // ── Вычисление отступов и максимальных длин ──

  const padLeft = integerPart.indexOf('0') >= 0
    ? integerPart.length - integerPart.indexOf('0')
    : -1;

  const maxLeft = integerPart.length === 0 || integerPart[0] === '0' || integerPart[0] === '9'
    ? integerPart.length
    : -1;

  const padRight = decimalsPart.indexOf('0') >= 0
    ? decimalsPart.lastIndexOf('0') + 1
    : -1;

  const maxRight = decimalsPart.length === 0 || decimalsPart[decimalsPart.length - 1] === '0' || decimalsPart[decimalsPart.length - 1] === '9'
    ? decimalsPart.length
    : -1;

  // ── Обработка символа '+' как динамического заменителя знака ──

  prefix = applySignPlaceholder(prefix, value);
  suffix = applySignPlaceholder(suffix, value);

  return {
    negativeType,
    negativeLeftPos,
    negativeRightPos,
    negativeLeftSymbol,
    negativeRightSymbol,
    suffix,
    prefix,
    absMask,
    decimalChar,
    integerSeparator,
    decimalsSeparator,
    padLeft,
    maxLeft,
    padRight,
    maxRight,
  };
}

/**
 * Определяет, какой символ является десятичной точкой в строке формата.
 * Обрабатывает неоднозначные случаи, когда '.' и ',' могут быть как десятичной точкой, так и разделителем.
 */
function detectDecimalChar(format: string): string {
  const dotIdx = format.indexOf('.');
  const commaIdx = format.indexOf(',');
  const lastCommaIdx = format.lastIndexOf(',');
  const lastDotIdx = format.lastIndexOf('.');

  // Если последний символ — ',' и других запятых нет → запятая — десятичный разделитель
  if (format[format.length - 1] === ',' && commaIdx === format.length - 1) {
    return ',';
  }

  if (dotIdx > -1) {
    if (dotIdx === lastDotIdx) {
      return '.';                       // одна точка → это десятичный разделитель
    }
    return ',';                         // несколько точек → точка — разделитель тысяч, запятая — десятичный
  }

  if (commaIdx > -1) {
    if (commaIdx === lastCommaIdx) {
      return ',';                       // одна запятая → это десятичный разделитель
    }
    return '.';                         // несколько запятых → запятая — разделитель тысяч, точка — десятичный
  }

  return '';
}

/**
 * Заменяет '+' в префиксе/суффиксе на соответствующий знак в зависимости от значения.
 * '+' → '+' для положительных, '-' для отрицательных, '' для нуля.
 */
function applySignPlaceholder(text: string, value: number): string {
  const plusPos = text.indexOf('+');
  if (plusPos === -1) return text;

  let sign: string;
  if (value > 0) sign = '+';
  else if (value < 0) sign = '-';
  else sign = '';

  return text.slice(0, plusPos) + sign + text.slice(plusPos + 1);
}
