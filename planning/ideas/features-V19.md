# OpenAMX Language Features

This is a repository of new feature ideas for the language syntax and other aspects of this project, including the accompanying CLI or Desktop App.
The core of the language can be found on the `src` directory.
When modifying the language, ensure the syntax highlighting tools are also updated both for the `vscode-extension` and the `desktop-app`.

# Charts

The current behaviour of the chart language construct is to render or display a table with the data from the chart right underneath the chart.

Examples of the current syntax of the chart can be found on the `examples/07_Tables_Charts_and_Named_Outputs.amx` file.

We need to add a new feature to the chart syntax that allows switching off the rendering or display of the data table underneath the chart. An example of this syntax is below:

```amx
chart screeningScores = bar(scores) {
  title: "Score by screening"
  description: "Illustrative severity multiplied by occurrence"
  series "Illustrative score"
  showTable true
}

show screeningScores
```

The showTable parameter should be optional (i.e. it might not be present) and default to false.

# Units of Measure

The current behaviour when specifying composed units of measure is to be albe to specify operations with multiplication, division and exponentiation.

Examples of the current syntax of dimensions and units of measure can be found on the `examples/05_Measurements_and_Units.amx` file.

We need to add addition to this syntax in order to enable the calculation of unit conversions like temperature from Farenheit to Celsius or viceversa.

For example:

```amx
dimension Temperature

unit DegreesKelvin: Temperature
unit DegreesCelsius = DegreesKelvin + 273
unit DegreesFarenheit = (DegreesCelsius * 1.8) + 32
```

In addition to the above, the current implementation only accepts numbers in the unit conversion declarations. We need to extend this to be able to use the defined constants within the framework itself, like PI or E for example.