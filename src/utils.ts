import type { ArithmeticOperator, IParsedBracket } from './types';

export const ARITHMETIC_OPERATORS: ArithmeticOperator[] = ['/', '*', '+', '-'];

/** Проверяет, является ли значение конечным числом (не NaN, не Infinity) */
export function isFiniteNumber(num: unknown): num is number {
  return (typeof num === 'number') && !isNaN(num) && isFinite(num);
}

/**
 * Конвертирует строку в научной нотации в обычную десятичную строку.
 * Например: "1e-10" → "0.0000000001"
 */
export function convertScientificNotation(value: string): string {
  const trimmed = value.trim();
  const scientificRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)[eE][+-]?\d+$/;

  if (!scientificRegex.test(trimmed)) return value;

  const num = parseFloat(trimmed);
  if (isNaN(num)) return value;

  const absNum = Math.abs(num);
  if (absNum < 1e-6 || absNum > 1e15) {
    return num.toFixed(20).replace(/\.?0+$/, '');
  }
  return num.toString();
}

/**
 * Парсит квадратные скобки из строки формата.
 * Например: "[/1000]" или "[тыс, млн, млрд]"
 */
export function parseBrackets(input: string): IParsedBracket[] {
  const brackets: IParsedBracket[] = [];
  let insideBracket = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '[' && !insideBracket) {
      insideBracket = true;
      brackets.push({ headIndex: i, tailIndex: null, body: null });
    } else if (ch === ']' && insideBracket) {
      insideBracket = false;
      const current = brackets.find(b => b.tailIndex === null);
      if (current) {
        current.tailIndex = i;
        current.body = input.slice(current.headIndex, i + 1);
      }
    }
  }

  return brackets;
}

/**
 * Проверяет, является ли содержимое скобки арифметическим выражением, например "/1000" или "*3".
 * Возвращает true, если после оператора стоит валидное число.
 */
export function isArithmeticExpression(content: string): boolean {
  const operatorIndex = findOperatorIndex(content);
  if (operatorIndex === null) return false;

  const tail = content.slice(operatorIndex + 1).trim();
  const num = +tail;
  return !isNaN(num) && isFinite(num) && tail.length > 0;
}

/**
 * Проверяет, является ли содержимое скобки некорректным выражением
 * (оператор без валидного операнда). Например: "/ sdfsd".
 */
export function isMalformedExpression(content: string): boolean {
  const operatorIndex = findOperatorIndex(content);
  if (operatorIndex === null) return false;
  return content.slice(0, operatorIndex + 1).trim() === content[operatorIndex];
}

/** Находит индекс первого арифметического оператора в строке */
export function findOperatorIndex(content: string): number | null {
  for (const op of ARITHMETIC_OPERATORS) {
    const idx = content.indexOf(op);
    if (idx !== -1) return idx;
  }
  return null;
}

/** Применяет арифметическую операцию к значению */
export function applyArithmetic(value: number, operator: ArithmeticOperator, operand: number): number {
  switch (operator) {
    case '/': return value / operand;
    case '*': return value * operand;
    case '+': return value + operand;
    case '-': return value - operand;
  }
}
