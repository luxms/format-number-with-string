# @bi/format-number-with-string

A number formatting library that converts numeric values into human-readable strings using declarative format patterns. Extended fork of [format-number-with-string](https://www.npmjs.com/package/format-number-with-string).

## Installation

```bash
npm install @bi/format-number-with-string
```

## Usage

```ts
import formatNumberWithString from '@bi/format-number-with-string';

formatNumberWithString(1234.5, '-# ###.00').toString(); // "1 234.50"
```

## Format Syntax

### Sign Display

Use `+` as a dynamic sign placeholder — it renders `+` for positive, `-` for negative, and nothing for zero.

Use `-` for the standard behavior (only shows minus for negatives).

```ts
formatNumberWithString(334,  '+#').toString();  // "+334"
formatNumberWithString(-334, '+#').toString();  // "-334"
formatNumberWithString(0,    '+#').toString();  // "0"

formatNumberWithString(-334, '-#').toString();  // "-334"
formatNumberWithString(334,  '-#').toString();  // "334"
```

The sign can also appear after the number:

```ts
formatNumberWithString(334,  '#+').toString();  // "334+"
formatNumberWithString(-334, '#+').toString();  // "334-"
```

### Conditional Formatting

Split the format string with `;` to define separate formats for positive, negative, zero, and non-numeric values:

```
positive;negative;zero;non-number
```

```ts
formatNumberWithString(334,  '+ #;(#);zero').toString();  // "+ 334"
formatNumberWithString(-334, '+ #;(#);zero').toString();  // "(334)"
formatNumberWithString(0,    '+ #;(#);zero').toString();  // "zero"

formatNumberWithString('abc', '+ #;(#);zero;str').toString();  // "str"
```

### Arithmetic Operations

Apply math operations inside square brackets. Operations are chainable.

```ts
formatNumberWithString(1000, '#[+ 1000]').toString();  // "2000"
formatNumberWithString(1000, '#[* 2]').toString();     // "2000"
formatNumberWithString(1000, '#[/ 2]').toString();     // "500"
formatNumberWithString(1000, '#[- 100]').toString();   // "900"

// Chained operations (applied left to right)
formatNumberWithString(1000, '#[/2][+300][-50][*3]').toString();  // "22500"
```

### Magnitude Scaling

Define magnitude suffixes inside square brackets as a comma-separated list. Each entry corresponds to a power of 1000 (thousands, millions, billions, etc.). The value is automatically divided by the matching magnitude.

```ts
formatNumberWithString(234443,        '# ### [K, M, B, T]').toString();  // "234 K"
formatNumberWithString(460234543,     '# ### [K, M, B, T]').toString();  // "460 M"
formatNumberWithString(205460234543,  '# ### [K, M, B, T]').toString();  // "205 B"
formatNumberWithString(3205460234543, '# ### [K, M, B, T]').toString();  // "3 T"

// Skip lower magnitudes with empty entries
formatNumberWithString(3205460234543, '# ### [, , , T]').toString();  // "3 T"

// Combine with arithmetic and suffixes
formatNumberWithString(460234543, '# ### [/2][K, M, B, T] red balls').toString();
// "230 M red balls"
```

### Rounding Direction

Use `△` to force rounding up, `▽` to force rounding down:

```ts
formatNumberWithString(334.281, '△ #').toString();     // "335"
formatNumberWithString(334.281, '△ #.00').toString();  // "334.29"

formatNumberWithString(334.281, '▽ #').toString();     // "334"
formatNumberWithString(334.281, '▽ #.00').toString();  // "334.28"
```

### Non-Numeric Values

When the input is not a number (`undefined`, `null`, a string), a dash `-` is displayed in place of the number:

```ts
formatNumberWithString('word', '# str').toString();      // "- str"
formatNumberWithString(undefined, '^ # inch').toString(); // "^ - inch"
formatNumberWithString(null, '^ # inch').toString();      // "^ - inch"
```

### Format Placeholders

| Placeholder | Description                                    |
|-------------|------------------------------------------------|
| `#`         | Digit, omitted if not significant              |
| `0`         | Digit, zero-padded                             |
| `9`         | Digit, space-padded                            |
| `.`         | Decimal separator                              |
| `,`         | Thousands separator (or decimal, context-dependent) |
| ` ` (space) | Thousands separator                            |

### Result Properties

The returned value is a `String` object with additional properties:

```ts
const result = formatNumberWithString(1234, '$ #,###');
result.toString(); // "$ 1,234"
result.value;      // "1,234"
result.prefix;     // "$ "
result.suffix;     // ""
```

## API

### `formatNumberWithString(value, format, overrideOptions?)`

| Parameter        | Type      | Description                        |
|------------------|-----------|------------------------------------|
| `value`          | `unknown` | The value to format                |
| `format`         | `string`  | Format pattern string              |
| `overrideOptions`| `object`  | Optional `{ noUnits, noSeparator }`|

### Named Exports

The package also exports internal building blocks for advanced use:

```ts
import {
  deconstructFormat,   // Parse a format string into components
  createFormatter,     // Create a reusable formatter function
  isFiniteNumber,      // Type guard for finite numbers
  convertScientificNotation, // Convert scientific notation to plain string
} from '@bi/format-number-with-string';
```

## License

ISC
