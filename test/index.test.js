const formatNumberWithString = require('../index');

test('test 1', () => {
    expect(formatNumberWithString(+3345.9876, "#")).toBe('3346');
});

test('test 2', () => {
    expect(formatNumberWithString(-3345.9876, "#")).toBe('3346');
});

test('test 3', () => {
    expect(formatNumberWithString(+3345.9876, "-#")).toBe('3346');
});

test('test 4', () => {
    expect(formatNumberWithString(0, "-#")).toBe('0');
});

test('test 5', () => {
    expect(formatNumberWithString(-3345.9876, "-#")).toBe('-3346');
});

test('test 6', () => {
    expect(formatNumberWithString(+3345.9876, "+##")).toBe('+3346');
});

test('test 7', () => {
    expect(formatNumberWithString(0, "+#")).toBe('0');
});

test('test 8', () => {
    expect(formatNumberWithString(-3345.9876, "+#")).toBe('-3346');
});

test('test 9', () => {
    expect(formatNumberWithString(+3345.9876, "00000")).toBe('03346');
});

test('test 10', () => {
    expect(formatNumberWithString(+3345.9876, "00000.00")).toBe('03345.99');
});

test('test 11', () => {
    expect(formatNumberWithString(+3345.9876, "$ ##;(##);zero")).toBe('$ 3346');
});

test('test 12', () => {
    expect(formatNumberWithString(-3345.9876, "$ ##;(##);zero")).toBe('(3346)');
});

test('test 13', () => {
    expect(formatNumberWithString(1, "$ ##;(##);zero")).toBe('$ 1');
    expect(formatNumberWithString(0, "$ ##;(##);zero")).toBe('zero');
    expect(formatNumberWithString(-1, "$ ##;(##);zero")).toBe('(1)');
});

test('test 14', () => {
    expect(formatNumberWithString(-3345.9876, "#+")).toBe('3346-');
});

test('test 15', () => {
    expect(formatNumberWithString(3345.9876, "#+")).toBe('3346+');
});

test('test 16', () => {
    expect(formatNumberWithString(-3345.9876, "#.00+")).toBe('3345.99-');
});

test('test 17', () => {
    expect(formatNumberWithString(928.824, "###▽+")).toBe('928+');
});

test('test 18', () => {
    expect(formatNumberWithString(928.824, "###△+")).toBe('929+');
});

test('test 19', () => {
    expect(formatNumberWithString(-928.824, "###△+")).toBe('928-');
});

test('test 20', () => {
    expect(formatNumberWithString(928.824, "###+▽")).toBe('928+');
});

test('test 21', () => {
    expect(formatNumberWithString(-928.824, "##0.##0+▽")).toBe('929.000-');
});

test('test 22', () => {
    expect(formatNumberWithString(1000000, "##[/1000] руб")).toBe('1000 руб');
});

test('test 23', () => {
    expect(formatNumberWithString(0.523234, "#.#[*10] руб")).toBe('5.23234 руб');
});

test('test 23', () => {
    expect(formatNumberWithString(0.523234, "#.#[*10]+ руб▽")).toBe('5+ руб');
});

test('test 24', () => {
    expect(formatNumberWithString(0.523234, "#.#[*10]руб▽+")).toBe('5руб+');
});

test('test 25', () => {
    expect(formatNumberWithString(0.523234, "#.#[*10]руб▽+")).toBe('5руб+');
});

test('test 26', () => {
    expect(formatNumberWithString('h345.98', "#")).toBe('-');
});

test('test 27', () => {
    expect(formatNumberWithString(-3345.9876, "+$ #")).toBe('-$ 3346');
});

test('test 28', () => {
    expect(formatNumberWithString(-3345.9876, "# $+")).toBe('3346 $-');
});

test('test 29', () => {
    expect(formatNumberWithString(-3345.9876, "# $-")).toBe('3346 $-');
});

test('test 30', () => {
    expect(formatNumberWithString(-3345.9876, "# $")).toBe('3346 $');
});

test('test 31', () => {
    expect(formatNumberWithString(-3345.9876, "# -$")).toBe('3346 -$');
});

test('test 32', () => {
    expect(formatNumberWithString(-3345.9876, "# +$△;(# руб);zero")).toBe('(3346 руб)');
});

test('test 33', () => {
    expect(formatNumberWithString(0, "# +$△;(# руб);zero")).toBe('zero');
});

test('test 34', () => {
    expect(formatNumberWithString(342, "# +$△;(# руб);zero")).toBe('342 +$');
});

test('test 35', () => {
    expect(formatNumberWithString(341, "#[/2] +$▽;(# руб);zero")).toBe('170 +$');
});

test('test 36', () => {
    expect(formatNumberWithString(344, "#[/sdfsd]")).toBe('344');
});

// '△'
// '▽'
