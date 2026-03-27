import formatNumberWithString from '../src/index';
import type { IFormattedResult } from '../src/types';

describe('formatNumberWithString', () => {

  // ── Знак перед числом ──

  describe('знак перед числом', () => {
    it('# без знака — положительное число остаётся без знака', () => {
      expect(formatNumberWithString(3345, '#').toString()).toBe('3345');
    });

    it('# без знака — отрицательное число отображается без минуса', () => {
      expect(formatNumberWithString(-3345, '#').toString()).toBe('3345');
    });

    it('+# — положительное число с плюсом', () => {
      expect(formatNumberWithString(3345, '+#').toString()).toBe('+3345');
    });

    it('+# — отрицательное число с минусом', () => {
      expect(formatNumberWithString(-3345, '+#').toString()).toBe('-3345');
    });

    it('-# — отрицательное число с минусом', () => {
      expect(formatNumberWithString(-3345, '-#').toString()).toBe('-3345');
    });

    it('-# — положительное число без знака', () => {
      expect(formatNumberWithString(3345, '-#').toString()).toBe('3345');
    });

    it('-# — ноль без знака', () => {
      expect(formatNumberWithString(0, '-#').toString()).toBe('0');
    });

    it('+# — ноль без знака', () => {
      expect(formatNumberWithString(0, '+#').toString()).toBe('0');
    });
  });

  // ── Знак после числа ──

  describe('знак после числа', () => {
    it('#+ — положительное число с плюсом справа', () => {
      expect(formatNumberWithString(3345, '#+').toString()).toBe('3345+');
    });

    it('#+ — отрицательное число с минусом справа', () => {
      expect(formatNumberWithString(-3345, '#+').toString()).toBe('3345-');
    });

    it('#- — отрицательное число с минусом справа', () => {
      expect(formatNumberWithString(-3345, '#-').toString()).toBe('3345-');
    });

    it('#- — положительное число без знака', () => {
      expect(formatNumberWithString(3345, '#-').toString()).toBe('3345');
    });
  });

  // ── Условное форматирование (положительное;отрицательное;ноль) ──

  describe('условное форматирование', () => {
    const fmt = '+ ##;(##);zero';

    it('положительное значение — формат из первого фрагмента', () => {
      expect(formatNumberWithString(3345, fmt).toString()).toBe('+ 3345');
    });

    it('отрицательное значение — формат из второго фрагмента (скобки)', () => {
      expect(formatNumberWithString(-3345, fmt).toString()).toBe('(3345)');
    });

    it('ноль — формат из третьего фрагмента', () => {
      expect(formatNumberWithString(0, fmt).toString()).toBe('zero');
    });
  });

  // ── Округление ──

  describe('округление', () => {
    it('▽ — округление вниз с дробной частью', () => {
      expect(formatNumberWithString(3345.826, '▽ ###.00').toString()).toBe('3345.82');
    });

    it('▽ — округление вниз без дробной части', () => {
      expect(formatNumberWithString(3345.826, '▽ ###').toString()).toBe('3345');
    });

    it('△ — округление вверх с дробной частью', () => {
      expect(formatNumberWithString(3345.826, '△ ###.00').toString()).toBe('3345.83');
    });

    it('△ — округление вверх без дробной части', () => {
      expect(formatNumberWithString(3345.826, '△ ###').toString()).toBe('3346');
    });

    it('▽ — округление вниз с префиксом и дробной частью', () => {
      expect(formatNumberWithString(3345.826, '▽ $ ###.00').toString()).toBe('$ 3345.82');
    });

    it('▽ — округление вниз с префиксом без дробной части', () => {
      expect(formatNumberWithString(3345.826, '▽ $ ###').toString()).toBe('$ 3345');
    });
  });

  // ── Арифметические операции в скобках ──

  describe('арифметические операции в скобках', () => {
    it('[/N] — деление', () => {
      expect(formatNumberWithString(1000, '##[/1000]').toString()).toBe('1');
    });

    it('[*N] — умножение', () => {
      expect(formatNumberWithString(1000, '#[*3]').toString()).toBe('3000');
    });

    it('[+N] — сложение', () => {
      expect(formatNumberWithString(1000, '#[+300]').toString()).toBe('1300');
    });

    it('[-N] — вычитание', () => {
      expect(formatNumberWithString(1000, '#[-300]').toString()).toBe('700');
    });

    it('[/текст] — некорректный операнд игнорируется', () => {
      expect(formatNumberWithString(3345, '#[/sdfsd]').toString()).toBe('3345');
    });
  });

  // ── Нечисловые значения ──

  describe('нечисловые значения', () => {
    it('строка вместо числа — отображается прочерк', () => {
      expect(formatNumberWithString('h3345', '#').toString()).toBe('-');
    });

    it('строка — условный формат выбирает 4-й фрагмент', () => {
      expect(formatNumberWithString('word123', '+ #;(#);zero;str').toString()).toBe('str');
    });

    it('строка — суффикс сохраняется, значение — прочерк', () => {
      expect(formatNumberWithString('word123', '# str').toString()).toBe('- str');
    });

    it('строка — свойство value пустое', () => {
      expect((formatNumberWithString('word123', '# str') as unknown as IFormattedResult).value).toBe('');
    });

    it('строка — формат с дробной частью, отображается прочерк', () => {
      expect(formatNumberWithString('word123', '#.00').toString()).toBe('-');
    });

    it('undefined — отображается прочерк с префиксом и суффиксом', () => {
      expect(formatNumberWithString(undefined, '^ # inch').toString()).toBe('^ - inch');
    });

    it('null — отображается прочерк с префиксом и суффиксом', () => {
      expect(formatNumberWithString(null, '^ # inch').toString()).toBe('^ - inch');
    });
  });

  // ── Масштабирование по разрядам ──

  describe('масштабирование по разрядам', () => {
    const rateFormat = '# ### [тыс, млн, млрд, тера]';

    it('тысячи', () => {
      expect(formatNumberWithString(234443, rateFormat).toString()).toBe('234 тыс');
    });

    it('миллионы', () => {
      expect(formatNumberWithString(460234543, rateFormat).toString()).toBe('460 млн');
    });

    it('миллиарды', () => {
      expect(formatNumberWithString(205460234543, rateFormat).toString()).toBe('205 млрд');
    });

    it('тера', () => {
      expect(formatNumberWithString(3205460234543, rateFormat).toString()).toBe('3 тера');
    });

    it('пробелы между числом и суффиксом разряда', () => {
      expect(formatNumberWithString(460234543, rateFormat).toString()).toBe('460 млн');
    });

    it('без пробелов между числом, разрядом и постфиксом', () => {
      expect(formatNumberWithString(460234543, '# ###[тыс, млн, млрд, тера]мячей').toString()).toBe('460млнмячей');
    });

    it('пользовательские названия разрядов', () => {
      expect(formatNumberWithString(460234543, '# ### [т., лимонов, млрд., трл]').toString()).toBe('460 лимонов');
    });

    it('разряды с дополнительным постфиксом', () => {
      expect(formatNumberWithString(460234543, '# ### [тыс, млн, млрд, тера] красных мячей').toString()).toBe('460 млн красных мячей');
    });
  });

  // ── Условное форматирование с разрядами и постфиксами ──

  describe('условное форматирование с разрядами', () => {
    const fmt = '+# ### [тыс, млн, млрд, тера] красных мячей;(# ###) [тыс, млн, млрд, тера] красных мячей;zero';

    it('отрицательное значение — скобки + разряд + постфикс', () => {
      expect(formatNumberWithString(-460234543, fmt).toString()).toBe('(460) млн красных мячей');
    });

    it('ноль — текст из третьего фрагмента', () => {
      expect(formatNumberWithString(0, fmt).toString()).toBe('zero');
    });

    it('положительное значение — плюс + разряд + постфикс', () => {
      expect(formatNumberWithString(460234543, fmt).toString()).toBe('+460 млн красных мячей');
    });
  });

  // ── Комбинированные случаи ──

  describe('комбинированные случаи', () => {
    it('несколько арифметических операций + разряды', () => {
      expect(formatNumberWithString(460234543, '# ### [  /  2  ][ / 23][  *30][тыс, млн, млрд, тера] красных мячей').toString()).toBe('300 млн красных мячей');
    });

    it('некорректные операции + текстовые скобки + разряды', () => {
      expect(formatNumberWithString(460234543, '# ### [  /  sdf2134 ][ * sdfsdf234][sfse234kjh][тыс, млн, млрд, тера] красных мячей').toString()).toBe('460 235 sfse234kjh красных мячей');
    });

    it('деление + дробная часть + разряды', () => {
      expect(formatNumberWithString(460234543, '+# ###.000 [/2][тыс, млн, млрд, тера] красных мячей').toString()).toBe('+230.117 млн красных мячей');
    });
  });

  // ── Научная нотация ──

  describe('научная нотация', () => {
    it('положительное число в научной нотации', () => {
      expect(formatNumberWithString(1e-10, '#.##########').toString()).toBe('0.0000000001');
    });

    it('отрицательное число в научной нотации', () => {
      expect(formatNumberWithString(-1e-10, '-#.##########').toString()).toBe('-0.0000000001');
    });

    it('большое число в научной нотации с разделителями', () => {
      expect(formatNumberWithString(1.5e+6, '### ###').toString()).toBe('1 500 000');
    });

    it('научная нотация как строка', () => {
      expect(formatNumberWithString(1e-10, '#.##########').toString()).toBe('0.0000000001');
    });

    it('научная нотация с фиксированной дробной частью', () => {
      expect(formatNumberWithString(1.2345e-5, '0.00000000').toString()).toBe('0.00001235');
    });

    it('очень маленькое число в научной нотации', () => {
      expect(formatNumberWithString(1e-15, '0.################').toString()).toBe('0.000000000000001');
    });
  });
});
