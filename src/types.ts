/** Тип отображения отрицательных чисел */
export type NegativeType = 'left' | 'right' | 'brackets' | 'none';

/** Направление округления */
export type RoundingDirection = 'up' | 'down' | '';

/** Арифметический оператор в скобочных выражениях */
export type ArithmeticOperator = '/' | '*' | '+' | '-';

/** Результат разбора строки формата числа */
export interface IDeconstructedFormat {
  negativeType: NegativeType;
  negativeLeftPos: number;
  negativeRightPos: number;
  negativeLeftSymbol: string;
  negativeRightSymbol: string;
  suffix: string;
  prefix: string;
  absMask: string;
  decimalChar: string;
  integerSeparator: string;
  decimalsSeparator: string;
  padLeft: number;
  maxLeft: number;
  padRight: number;
  maxRight: number;
}

/** Опции форматирования числа */
export interface IFormatterOptions {
  negative?: string;
  negativeOut?: boolean;
  negativeType?: NegativeType;
  negativeLeftSymbol?: string;
  negativeRightSymbol?: string;
  negativeLeftOut?: boolean;
  negativeRightOut?: boolean;
  prefix?: string;
  suffix?: string;
  separate?: boolean;
  separator?: string;
  integerSeparator?: string;
  decimalsSeparator?: string;
  decimal?: string;
  padLeft?: number;
  padRight?: number;
  truncate?: number | null;
  round?: number | null;
  allowedSeparators?: string[];
}

/** Опции переопределения, передаваемые в функцию format */
export interface IFormatOverrideOptions {
  noUnits?: boolean;
  noSeparator?: boolean;
}

/** Расширенный результат форматирования с метаданными value/prefix/suffix */
export type IFormattedResult = string & {
  value: string;
  prefix: string;
  suffix: string;
};

/** Разобранная скобочная конструкция из строки формата */
export interface IParsedBracket {
  headIndex: number;
  tailIndex: number | null;
  body: string | null;
}
