'use strict';

function deconstructNumberFormat(requiredFormat, value) {


    var format= requiredFormat || '-9,999.90';

    format=format.trim(); //ignore leading and trailing spaces

    // *********************************************************************************
    // find position and type of negative and contents of prefix and suffix text
    // *********************************************************************************

    var negativeType = '', negativeRightSymbol = '', negativeLeftSymbol = '',
        negativeRightPos = -1, negativeLeftPos = -1,
        absFormat,
        prefix = '', suffix = '';

    // brackets as negative
    if (/^([^()]+)?[(]([^09#]+)?[09#., ]+([^)]+)?[)](.+)?$/.test(format)) {
        negativeType = 'brackets';
        negativeLeftPos = format.indexOf("(");
        negativeLeftSymbol = '('
        if (negativeLeftPos > 0) { //after prefix
            prefix = format.slice(0, negativeLeftPos);
        } else {
            prefix = format.search(/0|9|#/) > 0 ? format.slice(1, format.search(/0|9|#/)) : "";
        }
        format = format.slice(prefix.length+1);

        negativeRightPos = format.indexOf(")");
        negativeRightSymbol = ')'
        if (negativeRightPos < format.length-1) { //before prefix
            suffix = format.slice(negativeRightPos+1);
            format = format.slice(0, negativeRightPos);
        } else {
            suffix = format.search(/[^09#,.]([^09#](.+)?)?[)]$/) > -1  ? format.slice(format.search(/[^09#,.]([^09#](.+)?)?[)]$/), -1) : "";
            format = format.slice(0, format.length - suffix.length - 1);
            negativeRightPos = 0;
        }

    } else if (format.indexOf("-") === -1){
        //positive values only
        negativeType = 'none';
        prefix = format.search(/[.,]?[09#]/) > 0 ? format.slice(0, format.search(/[.,]?[09#]/)) : "";
        format = format.slice(prefix.length);
        suffix = format.search(/[^09#,.]([^09#]+|$)/) > -1  ? format.slice(format.search(/[^09#,.]([^09#]+|$)/)) : "";
        format = format.slice(0, format.length-suffix.length);

    } else if (/^([^09#-]+)?-.+$/.test(format)) {
        //negative symbol to left of number (before or after prefix)
        negativeType = 'left';
        negativeLeftPos = format.indexOf("-");
        negativeLeftSymbol = '-'
        if (negativeLeftPos > 0) { //after prefix
            prefix = format.slice(0, negativeLeftPos);
        } else {
            prefix = format.search(/[09#]/) > 0 ? format.slice(1, format.search(/[09#]/)) : "";
        }
        format = format.slice(prefix.length+1);
        suffix = format.search(/[^09#,.]([^09#]+|$)/) > -1  ? format.slice(format.search(/[^09#,.]([^09#]+|$)/)) : "";
        format = format.slice(0, format.length-suffix.length);

    } else {
        //negative symbol to right of number (before or after suffix)
        prefix = format.search(/[09#]/) > 0 ? format.slice(0, format.search(/[09#]/)) : "";
        format = format.slice(prefix.length);
        negativeType = 'right';
        negativeRightSymbol = '-'
        negativeRightPos = format.lastIndexOf("-");
        if (negativeRightPos < format.length-1) { //before suffix
            suffix = format.slice(negativeRightPos+1);
            format = format.slice(0, negativeRightPos);
        } else {
            suffix = format.search(/[^09#,.]([^09#](.+)?)?-$/) > -1  ? format.slice(format.search(/[^09#,.]([^09#](.+)?)?-$/), format.length-1) : "";
            format = format.slice(0, format.length - suffix.length - 1);
            negativeRightPos = 0;
        }
    }

    // *********************************************************************************
    //include spaces with negative symbols
    // *********************************************************************************

    //When negative is before prefix move spaces from start of prefix to end of negative symbol
    while (negativeLeftPos === 0 && prefix && prefix[0] === ' ') {
        negativeLeftSymbol = negativeLeftSymbol + ' ';
        prefix = prefix.slice(1);
    }

    //When negative follows suffix move spaces end of suffix to start of negative symbol
    while (negativeRightPos === 0 && suffix && suffix[suffix.length-1] === ' ') {
        negativeRightSymbol = ' ' + negativeRightSymbol;
        suffix = suffix.slice(0, -1);
    }

    //When negative follows prefix move spaces from start of format to end of negative symbol
    while (negativeLeftPos > 0 && format.length && format[0] === ' ') {
        negativeLeftSymbol = negativeLeftSymbol + ' ';
        format = format.slice(1);
    }

    //When negative before suffix move spaces from end of format to start of negative symbol
    while (negativeRightPos > 0 && format.length && format[format.length-1] === ' ') {
        negativeRightSymbol = ' ' + negativeRightSymbol;
        format = format.slice(0, -1);
    }

    var absMask = format;

    // *********************************************************************************
    //find the decimal character and parts of absolute format
    // *********************************************************************************

    var decimalChar = '', decimalsPart = '', integerPart = '', decimalsSeparator = '', integerSeparator = '';

    //if last char is a ',' and there are no other commas then use this as decimal point
    if (format[format.length-1] === ',' && format.indexOf(',') === format.length-1) {
        decimalChar = ',';
        //otherwise use consider '.'
    } else if (format.indexOf('.') > -1) {
        if (format.indexOf('.') === format.lastIndexOf('.')) {
            decimalChar = ".";
        } else {
            // two of '.' means this must be the separator, so assume  ',' is the decimal
            decimalChar = ',';
        }
        //otherwise use ',' if it exists and there is only one
    } else if (format.indexOf(',') > -1) {
        if (format.indexOf(',') === format.lastIndexOf(',')) {
            decimalChar = ',';
        } else {
            decimalChar = '.';
        }
    }

    if (decimalChar && format.indexOf(decimalChar)>-1) {
        decimalsPart = format.slice(format.indexOf(decimalChar)+1);
        integerPart = format.slice(0,format.indexOf(decimalChar));
    } else {
        integerPart = format;
        decimalsPart = '';
    }

    while (decimalsPart.length && decimalsPart.search(/[., ]$/) > -1) {
        decimalsPart = decimalsPart.slice(0, -1);
    }

    while (integerPart.length && integerPart[0].search(/[., ]/) > -1) {
        integerPart = integerPart.slice(1);
    }

    //find the thousands/thousanths separators
    if (integerPart && integerPart.search(/[., ]/) > 0) {
        integerSeparator = integerPart[integerPart.search(/[., ]/)];
        integerPart = integerPart.replace(/[., ]/g, "");
    }

    if (decimalsPart && decimalsPart.search(/[., ]/) > 0) {
        decimalsSeparator = decimalsPart[decimalsPart.search(/[., ]/)];
        decimalsPart = decimalsPart.replace(/[., ]/g, "");
    }

    if ((integerPart.length && !(/^[09#]+$/).test(integerPart)) || (decimalsPart.length && !(/^[09#]+$/).test(decimalsPart))) {return false};

    // *********************************************************************************
    //resolve length and padding
    // *********************************************************************************

    var padLeft, maxLeft, padRight, maxRight;
    padLeft = integerPart.indexOf("0") >= 0 ? integerPart.length - integerPart.indexOf("0") : -1;
    maxLeft = integerPart.length === 0 ||integerPart[0] === "0" || integerPart[0] === "9" ? integerPart.length : -1;
    padRight = decimalsPart.indexOf("0") >= 0 ? decimalsPart.lastIndexOf("0")+1 : -1;
    maxRight = decimalsPart.length === 0 || decimalsPart[decimalsPart.length-1] === "0" || decimalsPart[decimalsPart.length-1] === "9" ? decimalsPart.length : -1;


    // custom additionals - makes '+' sign something like a variable

    let plusPositionOfPrefix = prefix.indexOf('+');
    let plusPositionOfSuffix = suffix.indexOf('+');

    let substringOfstring;
    let substringOfstringLeftPart;
    let substringOfstringRightPart;

    if (plusPositionOfPrefix !== -1) {
        if (plusPositionOfPrefix === 0) {
            substringOfstring = prefix.slice(1);

            if (value > 0) {
                prefix = '+' + substringOfstring;
            } else if (value < 0) {
                prefix = '-' + substringOfstring;
            } else if (value === 0) {
                prefix = substringOfstring;
            }

        } else {
            substringOfstringLeftPart = prefix.slice(0, plusPositionOfPrefix);
            substringOfstringRightPart = prefix.slice(plusPositionOfPrefix + 1);

            if (value > 0) {
                prefix = substringOfstringLeftPart + '+' + substringOfstringRightPart;
            } else if (value < 0) {
                prefix = substringOfstringLeftPart + '-' + substringOfstringRightPart;
            } else if (value === 0) {
                prefix = substringOfstringLeftPart + substringOfstringRightPart;
            }
        }
    }


    if (plusPositionOfSuffix !== -1) {
        if (plusPositionOfSuffix === 0) {
            substringOfstring = suffix.slice(1);

            if (value > 0) {
                suffix = '+'+substringOfstring;
            } else {
                suffix = '-'+substringOfstring;
            }

        } else {
            substringOfstringLeftPart = suffix.slice(0, plusPositionOfSuffix);
            substringOfstringRightPart = suffix.slice(plusPositionOfSuffix + 1);

            if (value > 0) {
                suffix = substringOfstringLeftPart + '+' + substringOfstringRightPart;
            } else {
                suffix = substringOfstringLeftPart + '-' + substringOfstringRightPart;
            }
        }
    }

    // *********************************************************************************
    // output
    // *********************************************************************************

    var deconstructedFormat = {
        negativeType: negativeType,
        negativeLeftPos: negativeLeftPos,
        negativeRightPos: negativeRightPos,
        negativeLeftSymbol: negativeLeftSymbol,
        negativeRightSymbol: negativeRightSymbol,
        suffix: suffix,
        prefix: prefix,
        absMask: absMask,
        decimalChar: decimalChar,
        integerSeparator: integerSeparator,
        decimalsSeparator: decimalsSeparator,
        padLeft: padLeft,
        maxLeft: maxLeft,
        padRight: padRight,
        maxRight: maxRight
    }

    return deconstructedFormat;
}

function formatter(options) {
    options = options || {};


    // *********************************************************************************************
    // Set defaults for negatives
    // options.negative, options.negativeOut, options.separator retained for backward compatibility
    // *********************************************************************************************

    // type of negative; default left
    options.negativeType = options.negativeType || (options.negative === 'R' ? 'right' : 'left')

    // negative symbols '-' or '()'
    if (typeof options.negativeLeftSymbol !== 'string') {
        switch (options.negativeType) {
            case 'left':
                options.negativeLeftSymbol = '-';
                break;
            case 'brackets':
                options.negativeLeftSymbol = '(';
                break;
            default:
                options.negativeLeftSymbol = '';
        }
    }
    if (typeof options.negativeRightSymbol !== 'string') {
        switch (options.negativeType) {
            case 'right':
                options.negativeRightSymbol = '-';
                break;
            case 'brackets':
                options.negativeRightSymbol = ')';
                break;
            default:
                options.negativeRightSymbol = '';
        }
    }

    // whether negative symbol should be inside/outside prefix and suffix

    if (typeof options.negativeLeftOut !== "boolean") {
        options.negativeLeftOut = (options.negativeOut === false ? false : true);
    }
    if (typeof options.negativeRightOut !== "boolean") {
        options.negativeRightOut = (options.negativeOut === false ? false : true);
    }

    //prefix and suffix
    options.prefix = options.prefix || '';
    options.suffix = options.suffix || '';

    //separators
    if (typeof options.integerSeparator !== 'string') {
        options.integerSeparator = (typeof options.separator === 'string' ? options.separator : ',');
    }
    options.decimalsSeparator = typeof options.decimalsSeparator === 'string' ? options.decimalsSeparator : '';
    options.decimal = options.decimal || '.';

    //padders
    options.padLeft = options.padLeft || -1 //default no padding
    options.padRight = options.padRight || -1 //default no padding

    function format(number, overrideOptions, rounding) {
        overrideOptions = overrideOptions || {};

        if (number || number === 0) {
            number = '' + number;//convert number to string if it isn't already
        } else {
            return '';
        }

        //identify a negative number and make it absolute
        var output = [];
        var value = [];
        var prefix = [];
        var suffix = [];
        var negative = number.charAt(0) === '-';
        number = number.replace(/^\-/g, '');

        //Prepare output with left hand negative and/or prefix
        if (!options.negativeLeftOut && !overrideOptions.noUnits) {
            output.push(options.prefix);
            prefix.push(options.prefix);
        }
        if (negative) {
            output.push(options.negativeLeftSymbol);
            value.push(options.negativeLeftSymbol);
        }
        if (options.negativeLeftOut && !overrideOptions.noUnits) {
            output.push(options.prefix);
            prefix.push(options.prefix);
        }

        //Format core number
        number = number.split('.');
        if (options.round != null) round(number, options.round, rounding);
        if (options.truncate != null) number[1] = truncate(number[1], options.truncate);
        if (options.padLeft > 0) number[0] = padLeft(number[0], options.padLeft);
        if (options.padRight > 0) number[1] = padRight(number[1], options.padRight);
        if (!overrideOptions.noSeparator && number[1]) number[1] = addDecimalSeparators(number[1], options.decimalsSeparator);
        if (!overrideOptions.noSeparator && number[0]) number[0] = addIntegerSeparators(number[0], options.integerSeparator);
        output.push(number[0]);
        value.push(number[0]);
        if (number[1]) {
            output.push(options.decimal);
            output.push(number[1]);
            value.push(options.decimal);
            value.push(number[1]);
        }

        //Prepare output with right hand negative and/or prefix
        if (options.negativeRightOut && !overrideOptions.noUnits) {
            output.push(options.suffix);
            suffix.push(options.suffix);
        }
        if (negative) {
            output.push(options.negativeRightSymbol);
            value.push(options.negativeRightSymbol);
        }
        if (!options.negativeRightOut && !overrideOptions.noUnits) {
            output.push(options.suffix);
            suffix.push(options.suffix);
        }

        //join output and return
        const result = new String(output.join(''));

        result.value = value.join('');
        result.prefix = prefix.join('');
        result.suffix = suffix.join('');

        return result;
    }

    format.negative = options.negative;
    format.negativeOut = options.negativeOut;
    format.negativeType = options.negativeType;
    format.negativeLeftOut = options.negativeLeftOut;
    format.negativeLeftSymbol = options.negativeLeftSymbol;
    format.negativeRightOut = options.negativeRightOut;
    format.negativeRightSymbol = options.negativeRightSymbol;
    format.prefix = options.prefix;
    format.suffix = options.suffix;
    format.separate = options.separate;
    format.integerSeparator = options.integerSeparator;
    format.decimalsSeparator = options.decimalsSeparator;
    format.decimal = options.decimal;
    format.padLeft = options.padLeft;
    format.padRight = options.padRight;
    format.truncate = options.truncate;
    format.round = options.round;

    function unformat(number, allowedSeparators) {
        allowedSeparators = allowedSeparators || [];
        if (options.allowedSeparators) {
            options.allowedSeparators.forEach(function (s) { allowedSeparators.push (s); });
        }
        allowedSeparators.push(options.integerSeparator);
        allowedSeparators.push(options.decimalsSeparator);
        number = number.replace(options.prefix, '');
        number = number.replace(options.suffix, '');
        var newNumber = number;
        do {
            number = newNumber;
            for (var i = 0; i < allowedSeparators.length; i++) {
                newNumber = newNumber.replace(allowedSeparators[i], '');
            }
        } while (newNumber != number);
        return number;
    }
    format.unformat = unformat;

    function validate(number, allowedSeparators) {
        number = unformat(number, allowedSeparators);
        number = number.split(options.decimal);
        if (number.length > 2) {
            return false;
        } else if (options.truncate != null && number[1] && number[1].length > options.truncate) {
            return false;
        }  else if (options.round != null && number[1] && number[1].length > options.round) {
            return false;
        } else {
            return /^-?\d+\.?\d*$/.test(number);
        }
    }
    return format;
}

//where x is already the integer part of the number
function addIntegerSeparators(x, separator) {
    x += '';
    if (!separator) return x;
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x)) {
        x = x.replace(rgx, '$1' + separator + '$2');
    }
    return x;
}

//where x is already the decimal part of the number
function addDecimalSeparators(x, separator) {
    x += '';
    if (!separator) return x;
    var rgx = /(\d{3})(\d+)/;
    while (rgx.test(x)) {
        x = x.replace(rgx, '$1' + separator + '$2');
    }
    return x;
}

//where x is the integer part of the number
function padLeft(x, padding) {
    x = x + '';
    var buf = [];
    while (buf.length + x.length < padding) {
        buf.push('0');
    }
    return buf.join('') + x;
}

//where x is the decimals part of the number
function padRight(x, padding) {
    if (x) {
        x += '';
    } else {
        x = '';
    }
    var buf = [];
    while (buf.length + x.length < padding) {
        buf.push('0');
    }
    return x + buf.join('');
}
function truncate(x, length) {
    if (x) {
        x += '';
    }
    if (x && x.length > length) {
        return x.substr(0, length);
    } else {
        return x;
    }
}

//where number is an array with 0th item as integer string and 1st item as decimal string (no negatives)
function round(number, places, rounding) {
    if (number[1] && places >= 0 && number[1].length > places) {
        //truncate to correct number of decimal places
        var decim = number[1].slice(0, places);
        //if next digit was >= 5 we need to round up
        if ((+(number[1].substr(places, 1)) >= 5 && rounding !== 'down') || rounding === 'up') {
            //But first count leading zeros as converting to a number will loose them
            var leadingzeros = "";
            while (decim.charAt(0)==="0") {
                leadingzeros = leadingzeros + "0";
                decim = decim.substr(1);
            }
            //Then we can change decim to a number and add 1 before replacing leading zeros
            decim = (+decim + 1) + '';
            decim = leadingzeros + decim;
            if (decim.length > places) {
                //adding one has made it longer
                number[0] = (+number[0]+ +decim.charAt(0)) + ''; //add value of firstchar to the integer part
                decim = decim.substring(1);   //ignore the 1st char at the beginning which is the carry to the integer part
            }
        }

        number[1] = decim;
    }
    return number;
}

function formatNumberWithStringOriginal(value, requiredFormat, overrideOptions, rounding) {

    var deconstructedFormat = []

    if (requiredFormat) deconstructedFormat = deconstructNumberFormat(requiredFormat.trim(), value);

    value = (value === null ? '' : value);
    value = value + ''; //make a string
    value = value.length ? value.trim() : '';

    var options = [];

    var format = formatter({
        negativeType: deconstructedFormat.negativeType,
        negativeLeftSymbol: deconstructedFormat.negativeLeftSymbol,
        negativeRightSymbol: deconstructedFormat.negativeRightSymbol,
        negativeLeftOut: deconstructedFormat.negativeLeftPos === 0,
        negativeRightOut: deconstructedFormat.negativeRightPos === 0,
        prefix: deconstructedFormat.prefix,
        suffix: deconstructedFormat.suffix,
        integerSeparator: deconstructedFormat.integerSeparator,
        decimalsSeparator: deconstructedFormat.decimalsSeparator,
        decimal: deconstructedFormat.decimalChar,
        padLeft: deconstructedFormat.padLeft,
        padRight: deconstructedFormat.padRight,
        round: deconstructedFormat.maxRight,
        truncate: null
    });

    return format(value, overrideOptions, rounding);
}


function getBracketsFromString(string) {
    var arr = string.split('');
    var bracketsOpened = false;
    var brackets = [];
    var i = 0;

    for (i; i < arr.length; i++) {
        if (arr[i] === '[' && bracketsOpened) continue
        if (arr[i] === ']' && !bracketsOpened) continue
        if (arr[i] === '[') {
            bracketsOpened = true;
            brackets.push({ headIndex: i, tailIndex: null, body: null });
            continue
        }
        if (arr[i] === ']') {
            bracketsOpened = false;
            var currentObjIdx = brackets.findIndex(o => o.tailIndex === null);
            brackets[currentObjIdx].tailIndex = i;
            brackets[currentObjIdx].body = string.slice(brackets[currentObjIdx].headIndex, i + 1);
            continue
        }
    }

    return brackets;
}

function isMathExpression(string, operands) {
    var operandIndex = null;
    operands.forEach(op => { if (operandIndex == null && string.indexOf(op) !== -1) operandIndex = string.indexOf(op) });
    var tail = operandIndex !== null ? string.slice(operandIndex + 1).trim() : NaN;
    return (typeof +tail === 'number') && !isNaN(tail) && isFinite(tail);
}

function isClassesOfNumber(string, rowRates) {
    return string.split(',').some(tmp => rowRates.includes(tmp.toLowerCase()));
}

function formatNumberWithString(value, requiredFormat, overrideOptions) {
    // custom additionals
    var fragments = requiredFormat.split(';');
    var reqFormat = requiredFormat;
    var valueIsNumber = (typeof value === 'number') && !isNaN(value) && isFinite(value);
    var operands = ['/', '*', '+', '-'];
    var rowRates = ['тыс', 'млн', 'млрд', 'тера'];

    if (valueIsNumber && value > 0) {
        reqFormat = fragments[0];
    } else if (valueIsNumber && value < 0) {
        reqFormat = fragments.length > 1 ? fragments[1] : fragments[0];
    } else if (valueIsNumber && value === 0) {
        reqFormat = fragments.length > 2 ? fragments[2] : fragments[0];
    } else {
        return fragments.length > 3 ? fragments[3] : '-';
    }

    var thousand = 1 * Math.pow(10, 3);
    var million = 1 * Math.pow(10, 6);
    var billion = 1 * Math.pow(10, 9);
    var trillion = 1 * Math.pow(10, 12);
    var brackets = getBracketsFromString(reqFormat);

    brackets.forEach((bracket, idx) => {
        var _bracket = getBracketsFromString(reqFormat).find(brck => bracket.body === brck.body); // пересчитывает индексы на которых теперь распологаются скобки
        var _content = _bracket.body.slice(1, _bracket.body.length - 1); // беру только содержимое без скобок


        if (isMathExpression(_content, operands)) {
            reqFormat = reqFormat.split(_bracket.body).join('');
            var _operandIndex = null;
            operands.forEach(opr => { if (_content.indexOf(opr) !== -1) _operandIndex = _content.indexOf(opr) });
            var _operand = _content[_operandIndex];
            var _number = Number(_content.slice(_operandIndex + 1).trim());
            value = Number(value);

            switch (_operand) {
                case '/':
                    value = value / _number
                    break
                case '*':
                    value = value * _number
                    break
                case '+':
                    value = value + _number
                    break
                case '-':
                    value = value - _number
                    break
            }

        } else if (isClassesOfNumber(_content, rowRates)) {
            var _reqFormatHead = '';
            var _reqFormatTail = '';

            if (_bracket.headIndex === 0) {
                _reqFormatTail = reqFormat.slice(_bracket.tailIndex + 1)
            } else if (_bracket.tailIndex === reqFormat.length - 1) {
                _reqFormatHead = reqFormat.slice(0, _bracket.headIndex)
            } else {
                _reqFormatHead = reqFormat.slice(0, _bracket.headIndex)
                _reqFormatTail = reqFormat.slice(_bracket.tailIndex + 1)
            }

            reqFormat = reqFormat.split(_bracket.body).join('');
            var _template = _content.split(' ').join('').split(',');

            var rates = [
                {
                    title: 'тыс',
                    value: thousand,
                },
                {
                    title: 'млн',
                    value: million,
                },
                {
                    title: 'млрд',
                    value: billion,
                },
                {
                    title: 'тера',
                    value: trillion,
                },
            ];

            var divider = 1;
            var matchedRate = null;

            rates.forEach((rate, idx) => {
                if (Math.abs(value) >= rate.value) {
                    var _matchedRate = _template.find(tempRate => tempRate.toLowerCase() === rate.title );
                    if (_matchedRate) {
                        matchedRate = _matchedRate;
                        divider = rate.value;
                    }
                }
            })

            if (matchedRate) {
                value = value / divider;
                reqFormat = _reqFormatHead + matchedRate + _reqFormatTail;
            }

        } else reqFormat = reqFormat.split(_bracket.body).join('');
    })

    var rounding = '';

    if (reqFormat.indexOf('△') !== -1) {
        rounding = 'up';
        reqFormat = reqFormat.split('△').join('');
    } else if (reqFormat.indexOf('▽') !== -1) {
        rounding = 'down';
        reqFormat = reqFormat.split('▽').join('');
    }

    if (reqFormat.indexOf('#') === -1 && reqFormat.indexOf('0') === -1) {                           // no number placeholder in format
        return reqFormat;
    }

    return formatNumberWithStringOriginal(value, reqFormat, overrideOptions, rounding);
}

module.exports = formatNumberWithString;