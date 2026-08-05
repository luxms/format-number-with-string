# @bi/format-number-with-string

[English version](README.md)

Библиотека для форматирования чисел, которая преобразует числовые значения в удобочитаемые строки с помощью декларативных шаблонов формата. Расширенный форк [format-number-with-string](https://www.npmjs.com/package/format-number-with-string).

## Установка

```bash
npm install @bi/format-number-with-string
```

## Использование

```ts
import formatNumberWithString from '@bi/format-number-with-string';

formatNumberWithString(1234.5, '-# ###.00').toString(); // "1 234.50"
```

## Синтаксис формата

### Отображение знака

Используйте `+` как динамический заполнитель знака: для положительного числа он выводит `+`, для отрицательного — `-`, а для нуля не выводит ничего.

Используйте `-` для стандартного поведения: минус выводится только для отрицательных чисел.

```ts
formatNumberWithString(334,  '+#').toString();  // "+334"
formatNumberWithString(-334, '+#').toString();  // "-334"
formatNumberWithString(0,    '+#').toString();  // "0"

formatNumberWithString(-334, '-#').toString();  // "-334"
formatNumberWithString(334,  '-#').toString();  // "334"
```

Знак также можно разместить после числа:

```ts
formatNumberWithString(334,  '#+').toString();  // "334+"
formatNumberWithString(-334, '#+').toString();  // "334-"
```

### Условное форматирование

Разделите строку формата символом `;`, чтобы задать отдельные форматы для положительных, отрицательных, нулевых и нечисловых значений:

```
positive;negative;zero;non-number
```

```ts
formatNumberWithString(334,  '+ #;(#);zero').toString();  // "+ 334"
formatNumberWithString(-334, '+ #;(#);zero').toString();  // "(334)"
formatNumberWithString(0,    '+ #;(#);zero').toString();  // "zero"

formatNumberWithString('abc', '+ #;(#);zero;str').toString();  // "str"
```

### Арифметические операции

Задавайте математические операции в квадратных скобках. Операции можно объединять в цепочки.

```ts
formatNumberWithString(1000, '#[+ 1000]').toString();  // "2000"
formatNumberWithString(1000, '#[* 2]').toString();     // "2000"
formatNumberWithString(1000, '#[/ 2]').toString();     // "500"
formatNumberWithString(1000, '#[- 100]').toString();   // "900"

// Операции в цепочке применяются слева направо
formatNumberWithString(1000, '#[/2][+300][-50][*3]').toString();  // "22500"
```

### Масштабирование по разрядам

Задайте суффиксы разрядов в квадратных скобках в виде списка, разделённого запятыми. Каждый элемент соответствует степени 1000: тысячам, миллионам, миллиардам и так далее. Значение автоматически делится в соответствии с подходящим разрядом.

```ts
formatNumberWithString(234443,        '# ### [K, M, B, T]').toString();  // "234 K"
formatNumberWithString(460234543,     '# ### [K, M, B, T]').toString();  // "460 M"
formatNumberWithString(205460234543,  '# ### [K, M, B, T]').toString();  // "205 B"
formatNumberWithString(3205460234543, '# ### [K, M, B, T]').toString();  // "3 T"

// Пропуск младших разрядов с помощью пустых элементов
formatNumberWithString(3205460234543, '# ### [, , , T]').toString();  // "3 T"

// Совмещение арифметики и суффиксов
formatNumberWithString(460234543, '# ### [/2][K, M, B, T] red balls').toString();
// "230 M red balls"
```

### Направление округления

Используйте `△`, чтобы принудительно округлять вверх, и `▽`, чтобы принудительно округлять вниз:

```ts
formatNumberWithString(334.281, '△ #').toString();     // "335"
formatNumberWithString(334.281, '△ #.00').toString();  // "334.29"

formatNumberWithString(334.281, '▽ #').toString();     // "334"
formatNumberWithString(334.281, '▽ #.00').toString();  // "334.28"
```

### Нечисловые значения

Если входное значение не является числом (`undefined`, `null` или строка), вместо числа выводится дефис `-`:

```ts
formatNumberWithString('word', '# str').toString();       // "- str"
formatNumberWithString(undefined, '^ # inch').toString(); // "^ - inch"
formatNumberWithString(null, '^ # inch').toString();      // "^ - inch"
```

### Заполнители формата

| Заполнитель | Описание                                              |
|-------------|-------------------------------------------------------|
| `#`         | Цифра, не выводится, если она незначащая               |
| `0`         | Цифра с дополнением нулями                             |
| `9`         | Цифра с дополнением пробелами                          |
| `.`         | Десятичный разделитель                                 |
| `,`         | Разделитель тысяч (или десятичный, в зависимости от контекста) |
| ` ` (пробел)| Разделитель тысяч                                      |

### Свойства результата

Возвращаемое значение — объект `String` с дополнительными свойствами:

```ts
const result = formatNumberWithString(1234, '$ #,###');
result.toString(); // "$ 1,234"
result.value;      // "1,234"
result.prefix;     // "$ "
result.suffix;     // ""
```

## API

### `formatNumberWithString(value, format, overrideOptions?)`

| Параметр         | Тип       | Описание                                  |
|------------------|-----------|-------------------------------------------|
| `value`          | `unknown` | Значение для форматирования               |
| `format`         | `string`  | Строка шаблона формата                    |
| `overrideOptions`| `object`  | Необязательный объект `{ noUnits, noSeparator }` |

### Именованные экспорты

Пакет также экспортирует внутренние компоненты для расширенного использования:

```ts
import {
  deconstructFormat,   // Разбор строки формата на компоненты
  createFormatter,     // Создание переиспользуемой функции форматирования
  isFiniteNumber,      // Проверка типа для конечных чисел
  convertScientificNotation, // Преобразование научной записи в обычную строку
} from '@bi/format-number-with-string';
```

## Лицензия

ISC
