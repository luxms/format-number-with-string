import type { IFormattedResult, IFormatOverrideOptions, RoundingDirection, ArithmeticOperator } from './types';
import { isFiniteNumber, convertScientificNotation, parseBrackets, isArithmeticExpression, isMalformedExpression, findOperatorIndex, applyArithmetic } from './utils';
import { deconstructFormat } from './deconstruct-format';
import { createFormatter } from './formatter';

export type { IDeconstructedFormat, IFormatterOptions, IFormatOverrideOptions, IFormattedResult, NegativeType, RoundingDirection } from './types';
export type { IFormatFunction } from './formatter';
export { deconstructFormat } from './deconstruct-format';
export { createFormatter } from './formatter';
export { isFiniteNumber, convertScientificNotation } from './utils';

/**
 * Внутреннее форматирование: применяет разобранный формат к значению.
 */
function formatWithDeconstructedFormat(value: unknown, requiredFormat: string, overrideOptions?: IFormatOverrideOptions, rounding?: RoundingDirection, originValue?: unknown): IFormattedResult {
  const deconstructed = requiredFormat ? deconstructFormat(requiredFormat.trim(), value as number) : {};

  // Нормализуем значение в строку
  let strValue = (value === null ? '' : '' + value).trim();

  // Конвертируем научную нотацию перед дальнейшей обработкой
  strValue = convertScientificNotation(strValue);

  if (!deconstructed) return '' as IFormattedResult;

  const format = createFormatter({
    negativeType: (deconstructed as any).negativeType,
    negativeLeftSymbol: (deconstructed as any).negativeLeftSymbol,
    negativeRightSymbol: (deconstructed as any).negativeRightSymbol,
    negativeLeftOut: (deconstructed as any).negativeLeftPos === 0,
    negativeRightOut: (deconstructed as any).negativeRightPos === 0,
    prefix: (deconstructed as any).prefix,
    suffix: (deconstructed as any).suffix,
    integerSeparator: (deconstructed as any).integerSeparator,
    decimalsSeparator: (deconstructed as any).decimalsSeparator,
    decimal: (deconstructed as any).decimalChar,
    padLeft: (deconstructed as any).padLeft,
    padRight: (deconstructed as any).padRight,
    round: (deconstructed as any).maxRight,
    truncate: null,
  });

  return format(strValue, overrideOptions, rounding, originValue) as unknown as IFormattedResult;
}

/**
 * Форматирует число по строке формата с поддержкой:
 * - Условного форматирования: "положительное;отрицательное;ноль;не_число"
 * - Скобочных выражений: `[/1000]`, `[*3]`, `[тыс, млн, млрд]`
 * - Направления округления: `△` (вверх), `▽` (вниз)
 * - Заменителей знака: `+` в префиксе/суффиксе
 * - Разделителей тысяч/десятичных, отступов и т.д.
 *
 * @param value - значение для форматирования
 * @param requiredFormat - строка формата
 * @param overrideOptions - опции переопределения
 * @returns отформатированная строка со свойствами `.value`, `.prefix`, `.suffix`
 */
function formatNumberWithString(value: unknown, requiredFormat: string, overrideOptions?: IFormatOverrideOptions): IFormattedResult {
  const fragments = requiredFormat.split(';');
  const valueIsNumber = isFiniteNumber(value);
  const originValue = value;
  let numValue: number = value as number;
  let reqFormat: string;
  let formattedByRates = false;

  // Выбираем фрагмент формата по знаку значения
  if (valueIsNumber && numValue > 0) {
    reqFormat = fragments[0];
  } else if (valueIsNumber && numValue < 0) {
    reqFormat = fragments.length > 1 ? fragments[1] : fragments[0];
  } else if (valueIsNumber && numValue === 0) {
    reqFormat = fragments.length > 2 ? fragments[2] : fragments[0];
  } else {
    numValue = 0;
    reqFormat = fragments.length > 3
      ? fragments[3]
      : fragments.length > 2
        ? fragments[2]
        : fragments[0];
  }

  // Обрабатываем скобочные выражения
  const brackets = parseBrackets(reqFormat);

  for (const bracket of brackets) {
    // Перепарсиваем для получения актуальных индексов после модификаций
    const updated = parseBrackets(reqFormat).find(b => b.body === bracket.body);
    if (!updated || !updated.body) continue;

    const content = updated.body.slice(1, -1);

    if (isArithmeticExpression(content)) {
      // Арифметика: [/1000], [*3], [+300], [-300]
      reqFormat = reqFormat.split(updated.body).join('');
      const opIdx = findOperatorIndex(content)!;
      const operator = content[opIdx] as ArithmeticOperator;
      const operand = Number(content.slice(opIdx + 1).trim());
      numValue = applyArithmetic(Number(numValue), operator, operand);

    } else if (isMalformedExpression(content)) {
      // Некорректное выражение вида [/ sdfsd] — просто удаляем
      reqFormat = reqFormat.split(updated.body).join('');

    } else if (!formattedByRates) {
      // Масштабирование по разрядам: [тыс, млн, млрд, тера]
      let headPart = '';
      let tailPart = '';

      if (updated.headIndex === 0) {
        tailPart = reqFormat.slice(updated.tailIndex! + 1);
      } else if (updated.tailIndex === reqFormat.length - 1) {
        headPart = reqFormat.slice(0, updated.headIndex);
      } else {
        headPart = reqFormat.slice(0, updated.headIndex);
        tailPart = reqFormat.slice(updated.tailIndex! + 1);
      }

      reqFormat = reqFormat.split(updated.body).join('');
      const templates = content.replace(/ /g, '').split(',');
      const rates = templates.map((_, idx) => Math.pow(10, (idx + 1) * 3));

      for (let i = rates.length; i >= 0; i--) {
        if (Math.abs(numValue) >= rates[i - 1] && !!templates[i - 1]) {
          numValue = numValue / rates[i - 1];
          reqFormat = headPart + templates[i - 1] + tailPart;
          formattedByRates = true;
          break;
        }
      }

    } else {
      // Уже отформатировано по разрядам — удаляем оставшиеся скобочные выражения
      reqFormat = reqFormat.split(updated.body).join('');
    }
  }

  // Определяем маркеры направления округления
  let rounding: RoundingDirection = '';
  if (reqFormat.indexOf('△') !== -1) {
    rounding = 'up';
    reqFormat = reqFormat.split('△').join('');
  } else if (reqFormat.indexOf('▽') !== -1) {
    rounding = 'down';
    reqFormat = reqFormat.split('▽').join('');
  }

  // Если в формате нет заполнителей числа — возвращаем как есть
  if (reqFormat.indexOf('#') === -1 && reqFormat.indexOf('0') === -1) {
    return reqFormat as IFormattedResult;
  }

  return formatWithDeconstructedFormat(numValue, reqFormat, overrideOptions, rounding, originValue);
}

export default formatNumberWithString;
