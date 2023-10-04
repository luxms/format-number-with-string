## This library extends the library (https://www.npmjs.com/package/format-number-with-string)

#### Сhanges and Additions

###### Now the "+" sign is a variable that guarantees the output in the resulting string of one of the signs (+ or -), if number is not zero

```
   eg: formatNumberWithString(334, "+#").toString() returns "+334"
   eg: formatNumberWithString(-334, "+#").toString() returns "-334"
```

###### The conditional split point comma format is now available. If the number is positive the first part of the format will be processed, if negative the second and if 0 the third

```
   eg: formatNumberWithString(334, "+ #;(#);zero").toString() returns "+334"
   eg: formatNumberWithString(-334, "+ #;(#);zero").toString() returns "(334)"
   eg: formatNumberWithString(0, "+ #;(#);zero").toString() returns "(zero)"
```

###### Now can apply some math operations and chain it

```
   eg: formatNumberWithString(1000, "#[ + 1000]").toString() returns "2000"
   eg: formatNumberWithString(1000, "#[ * 2]").toString() returns "2000"
   eg: formatNumberWithString(1000, "#[ / 2]").toString() returns "500"
   eg: formatNumberWithString(1000, "#[ - 100]").toString() returns "900"
   eg: formatNumberWithString(1000, "#[/2][+300][-50][*3]").toString() returns "22500"
```

###### Now can apply some optional postfixes (the value will be cast according to the optional postfixes)

```
   eg: formatNumberWithString(234443, "# ### [т., млн, млрд, тера]").toString() returns "234 т."
   eg: formatNumberWithString(460234543, "# ### [тыс, млн, млрд, тера]").toString() returns "460 млн"
   eg: formatNumberWithString(205460234543, "# ### [тыс, млн, МЛРРРДД, тера]").toString() returns "205 МЛРРРДД"
   eg: formatNumberWithString(3205460234543, "# ### [тыс, млн, млрд, трлн.]").toString() returns "3 трлн."
   eg: formatNumberWithString(3205460234543, "# ### [ , , , трлн.]").toString() returns "3 трлн."
   eg: formatNumberWithString(3205460234543, "# ### [, МЛН]").toString() returns "3205460 МЛН"
   eg: formatNumberWithString(460234543, "# ### [/2][тыс, млн, млрд, тера] красных мячей").toString() returns "230 млн красных мячей"

```


###### Now the number can be rounded up or down with special utf characters '△' '▽'

```
   eg: formatNumberWithStringExtended(334.281, "△ #").toString() returns "335"
   eg: formatNumberWithStringExtended(334.281, "△ #.00").toString() returns "334.29"
   
   eg: formatNumberWithStringExtended(334.281, "▽ #").toString() returns "334"
   eg: formatNumberWithStringExtended(334.281, "▽ #.00").toString() returns "334.28"
    
```

###### More examples

```
   eg: formatNumberWithString('word123', "+ #;(#);zero;str").toString() returns 'str'
   eg: formatNumberWithString('word123', "# str").toString() returns '- str'
   eg: formatNumberWithString('word123', "# str").value returns ''
   eg: formatNumberWithString('word123', "#.00").toString() returns '-'
   eg: formatNumberWithString(undefined, "^ # inch").toString() returns '^ - inch'
   eg: formatNumberWithString(null, "^ # inch").toString() returns '^ - inch'
```