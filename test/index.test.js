const formatNumberWithString = require('../index');

// Знак перед числом

test('test 1', () => {
    expect(formatNumberWithString(3345, "#").toString()).toBe('3345');
});

test('test 2', () => {
    expect(formatNumberWithString(-3345, "#").toString()).toBe('3345');
});

test('test 3', () => {
    expect(formatNumberWithString(3345, "+#").toString()).toBe('+3345');
});

test('test 4', () => {
    expect(formatNumberWithString(-3345, "+#").toString()).toBe('-3345');
});

test('test 5', () => {
    expect(formatNumberWithString(-3345, "-#").toString()).toBe('-3345');
});

test('test 6', () => {
    expect(formatNumberWithString(3345, "-#").toString()).toBe('3345');
});

test('test 7', () => {
    expect(formatNumberWithString(0, "-#").toString()).toBe('0');
});

test('test 8', () => {
    expect(formatNumberWithString(0, "+#").toString()).toBe('0');
});

// Знак после числа

test('test 9', () => {
    expect(formatNumberWithString(3345, "#+").toString()).toBe('3345+');
});

test('test 10', () => {
    expect(formatNumberWithString(-3345, "#+").toString()).toBe('3345-');
});

test('test 11', () => {
    expect(formatNumberWithString(-3345, "#-").toString()).toBe('3345-');
});

test('test 12', () => {
    expect(formatNumberWithString(3345, "#-").toString()).toBe('3345');
});

// Условное форматирование (положительное;отрицательное,нуль)

test('test 13', () => {
    expect(formatNumberWithString(3345, "+ ##;(##);zero").toString()).toBe('+ 3345');
});

test('test 14', () => {
    expect(formatNumberWithString(-3345, "+ ##;(##);zero").toString()).toBe('(3345)');
});

test('test 15', () => {
    expect(formatNumberWithString(0, "+ ##;(##);zero").toString()).toBe('zero');
});

// Округление вниз

test('test 16', () => {
    expect(formatNumberWithString(3345.826, "▽ ###.00").toString()).toBe('3345.82');
    expect(formatNumberWithString(3345.826, "▽ ###").toString()).toBe('3345');
});

// Округление вверх

test('test 17', () => {
    expect(formatNumberWithString(3345.826, "△ ###.00").toString()).toBe('3345.83');
    expect(formatNumberWithString(3345.826, "△ ###").toString()).toBe('3346');
});

// Округление c префиксом

test('test 18', () => {
    expect(formatNumberWithString(3345.826, "▽ $ ###.00").toString()).toBe('$ 3345.82');
    expect(formatNumberWithString(3345.826, "▽ $ ###").toString()).toBe('$ 3345');
});

// Деление на число

test('test 19', () => {
    expect(formatNumberWithString(1000, "##[/1000]").toString()).toBe('1');
});

// Умножение на число

test('test 20', () => {
    expect(formatNumberWithString(1000, "#[*3]").toString()).toBe('3000');
});

// Сложение с числом

test('test 21', () => {
    expect(formatNumberWithString(1000, "#[+300]").toString()).toBe('1300');
});

// Разность с числом

test('test 22', () => {
    expect(formatNumberWithString(1000, "#[-300]").toString()).toBe('700');
});

// Не число

test('test 23', () => {
    expect(formatNumberWithString('h3345', "#").toString()).toBe('-');
});

test('test 24', () => {
    expect(formatNumberWithString(3345, "#[/sdfsd]").toString()).toBe('3345');
});

// Разряды чисел

test('test 25', () => {
    expect(formatNumberWithString(234443, "# ### [тыс, млн, млрд, тера]").toString()).toBe('234 тыс');
});

test('test 26', () => {
    expect(formatNumberWithString(460234543, "# ### [тыс, млн, млрд, тера]").toString()).toBe('460 млн');
});

test('test 27', () => {
    expect(formatNumberWithString(205460234543, "# ### [тыс, млн, млрд, тера]").toString()).toBe('205 млрд');
});

test('test 28', () => {
    expect(formatNumberWithString(3205460234543, "# ### [тыс, млн, млрд, тера]").toString()).toBe('3 тера');
});

// Пробелы между разрядами

test('test 29', () => {
    expect(formatNumberWithString(460234543, "# ### [тыс, млн, млрд, тера]").toString()).toBe('460 млн');
});

test('test 30', () => {
    expect(formatNumberWithString(460234543, "# ###[тыс, млн, млрд, тера]мячей").toString()).toBe('460млнмячей');
});

// Порядок разрядов

test('test 31', () => {
    expect(formatNumberWithString(460234543, "# ### [т., лимонов, млрд., трл]").toString()).toBe('460 лимонов');
});

// Дополнительные постфиксы

test('test 33', () => {
    expect(formatNumberWithString(460234543, "# ### [тыс, млн, млрд, тера] красных мячей").toString()).toBe('460 млн красных мячей');
});

// Условное форматирование и разрядами и дополнительными постфиксами

test('test 34', () => {
    expect(formatNumberWithString(-460234543, "+# ### [тыс, млн, млрд, тера] красных мячей;(# ###) [тыс, млн, млрд, тера] красных мячей;zero").toString()).toBe('(460) млн красных мячей');
});

test('test 35', () => {
    expect(formatNumberWithString(0, "+# ### [тыс, млн, млрд, тера] красных мячей;(# ###) [тыс, млн, млрд, тера] красных мячей;zero").toString()).toBe('zero');
});

test('test 36', () => {
    expect(formatNumberWithString(460234543, "+# ### [тыс, млн, млрд, тера] красных мячей;(# ###) [тыс, млн, млрд, тера] красных мячей;zero").toString()).toBe('+460 млн красных мячей');
});

// Комбинированные случаи

test('test 37', () => {
    expect(formatNumberWithString(460234543, "# ### [  /  2  ][ / 23][  *30][тыс, млн, млрд, тера] красных мячей").toString()).toBe('300 млн красных мячей');
});

test('test 38', () => {
    expect(formatNumberWithString(460234543, "# ### [  /  sdf2134 ][ * sdfsdf234][sfse234kjh][тыс, млн, млрд, тера] красных мячей").toString()).toBe('460 235 sfse234kjh красных мячей');
});

test('test 39', () => {
    expect(formatNumberWithString(460234543, "+# ###.000 [/2][тыс, млн, млрд, тера] красных мячей").toString()).toBe('+230.117 млн красных мячей');
});

test('test 40', () => {
    expect(formatNumberWithString('word123', "+ #;(#);zero;str").toString()).toBe('str');
    expect(formatNumberWithString('word123', "# str").toString()).toBe('- str');
    expect(formatNumberWithString('word123', "# str").value).toBe('');
    expect(formatNumberWithString('word123', "#.00").toString()).toBe('-');
    expect(formatNumberWithString(undefined, "^ # inch").toString()).toBe('^ - inch');
    expect(formatNumberWithString(null, "^ # inch").toString()).toBe('^ - inch');
});