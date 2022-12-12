## This library extends the library (https://www.npmjs.com/package/format-number-with-string)

#### Сhanges and Additions

###### Now the "+" sign is a variable that guarantees the output in the resulting string of one of the signs (+ or -) if it is not zero

```
   eg: formatNumberWithStringExtended(334, "+#") returns "+334"
   eg: formatNumberWithStringExtended(-334, "+#") returns "-334"
```

###### The conditional split point comma format is now available. If the number is negative the first part of the format will be processed, if negative the second and if 0 the third

```
   eg: formatNumberWithStringExtended(334, "+ #;(#);zero") returns "+334"
   eg: formatNumberWithStringExtended(-334, "+ #;(#);zero") returns "(334)"
   eg: formatNumberWithStringExtended(0, "+ #;(#);zero") returns "(zero)"
```

###### Now can apply some math operations and chain it

```
   eg: formatNumberWithStringExtended(1000, "#[ + 1000]") returns "2000"
   eg: formatNumberWithStringExtended(1000, "#[ * 2]") returns "2000"
   eg: formatNumberWithStringExtended(1000, "#[ / 2]") returns "500"
   eg: formatNumberWithStringExtended(1000, "#[ - 100]") returns "900"
   eg: formatNumberWithStringExtended(1000, "#[/2][+300][-50][*3]") returns "22500"
```

###### Now can apply some optional postfixes (the value will be cast according to the optional postfixes)

```
   eg: formatNumberWithStringExtended(234443, "# ### [т., млн, млрд, тера]") returns "234 т."
   eg: formatNumberWithStringExtended(460234543, "# ### [тыс, млн, млрд, тера]") returns "460 млн"
   eg: formatNumberWithStringExtended(205460234543, "# ### [тыс, млн, МЛРРРДД, тера]") returns "205 МЛРРРДД"
   eg: formatNumberWithStringExtended(3205460234543, "# ### [тыс, млн, млрд, трлн.]") returns "3 трлн."
   eg: formatNumberWithStringExtended(3205460234543, "# ### [ , , , трлн.]") returns "3 трлн."
   eg: formatNumberWithStringExtended(3205460234543, "# ### [, МЛН]") returns "3205460 МЛН"
   eg: formatNumberWithStringExtended(460234543, "# ### [/2][тыс, млн, млрд, тера] красных мячей") returns "230 млн красных мячей"

```


###### Now the number can be rounded up or down with special utf characters '△' '▽'

```
   eg: formatNumberWithStringExtended(334.281, "△ #") returns "335"
   eg: formatNumberWithStringExtended(334.281, "△ #.00") returns "334.29"
   
   eg: formatNumberWithStringExtended(334.281, "▽ #") returns "334"
   eg: formatNumberWithStringExtended(334.281, "▽ #.00") returns "334.28"
    
```