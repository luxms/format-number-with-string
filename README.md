## This library extends the library (https://www.npmjs.com/package/format-number-with-string)

#### Сhanges and Additions

###### Now the "+" sign is a variable that guarantees the output in the resulting string of one of the signs (+ or -) if it is not zero

```
   eg: formatNumberWithStringExtended(+334, "+#") returns "+334"
   eg: formatNumberWithStringExtended(-334, "+#") returns "-334"
```

###### The conditional split point comma format is now available. If the number is negative the first part of the format will be processed, if negative the second and if 0 the third

```
   eg: formatNumberWithStringExtended(+334, "+ #;(#);zero") returns "+334"
   eg: formatNumberWithStringExtended(-334, "+ #;(#);zero") returns "(334)"
   eg: formatNumberWithStringExtended(0, "+ #;(#);zero") returns "(zero)"
```

###### The number can now be divided or multiplied by the number in square brackets

```
   eg: formatNumberWithStringExtended(+1000000, "#[/1000]") returns "1000"
```

###### Now the number can be rounded up or down with special utf characters '△' '▽'

```
   eg: formatNumberWithStringExtended(334.234, "#△") returns "+335"
   eg: formatNumberWithStringExtended(334.234, "#▽") returns "-334"
```


