# OpenAMX Language Features

These is a repository of new feature ideas for the language syntax and features aspects of this project.
The core of the language can be found on the `src` directory.

## Strings

- Develop the capability to interpolate strings using the following syntax:
```amx
let hello = "Hello"
let world = "World"
let hw = "${hello} ${world}!" <- hw is now "Hello World!"
```

## Records

- The Record syntax should be able to parse assignments that have new line characters between property value assignments.
- The following is currently not valid int he current implementation, but it should be.
```amx
type SomeRecordType {
    stringProp: String
    numberProp: Number
    booleanProp: Boolean
}

let mySpecificRecord = SomeRecordType {
    stringProp = "My String Value",
    numberProp = 42,
    booleanProp = true
}
```

## Lists

- Implement indexed access to lists to extract individual elements.
- AMX should implement a 1-base indexing system. In other words, the first element is 1 not 0
- For example:
```amx
let myList:String[] = ["a", "b", "c", "d"]

let myFirstElement = myList[1] <- contains "a"

let myPicker = 2
let myPickedElement = myList[myPicker] <-contains "b"

let myExpressionAccessedElement = myList[1 + 2] <- contains "c"
```
- Create standard language functions to add and remove elements from a list. These functions return the same list rather than returning a new copy. The following is valid syntax for this:
```amx
add "f" to myList <- myList is now ["a", "b", "c", "d", "f"]
add "e" to myList at 5 <- myList is now ["a", "b", "c", "d", "e", "f"]
remove 1 from myList <- myList is now ["a", "b", "c", "d", "e"]
remove 2 from myList at 1 <- myList is now ["c", "d", "e"]
```

## Units of Measure (UoM)

- Implement dimensions, units and measurements as first class citizens of the AMX language.
- Whilst not an authoritative reference the [e-lang](https://github.com/EngineersTools/e-lang) programming language can be used for inspiration on the grammar and types of constructs that the UoM system should support in AMX. Read the README.md file on this project.
- `e-lang` uses the concept of a "DimensionVector" which helps in performing checks and calculations between measurements.
- The UoM system should be used to statically type-check all relevant declarations.
- More specifically, AMX should implement the following syntax:
    - Dimensions can be declared as "base" or as "derived" from other dimensions.
    - A "base" dimension is declared as follows:
    ```amx
    dimension Length
    dimension Time
    ```
    - A "derived" dimension is declared by assigning a "dimension expression". The following are examples of valid dimension declarations:
    ```amx
    dimension Speed = Length / Time
    dimension Acceleration = Length / Time ^ 2
    dimension Area = Length ^ 2
    dimension Volume = Length ^ 3
    ```
    - Using declared dimensions, units of measure can be declared in a similar fashion to dimensions, as "base" and "derived". The following are valid examples of unit declarations: 
    ```amx
    unit meter: Length
    unit kilometer = 1000 * m
    unit minute: Time
    unit hour = 60 * minute
    unit meter_per_minute = meter / minute
    unit kilometer_per_hour = kilometer / hour
    unit square_meter = meter ^ 2
    ```
    - Finally, a dimension can be assigned to a variable to create a type that contains a numeric value (which could be an expression) and a unit. The following are valid examples of typing a variable with dimensions
    ```amx
    let x:Length = 10 meter
    let y:Length = 5 meter
    let u:Time = 2 minute
    let w:Speed = 5 meter_per_minute
    let a:Area = 25 square_meter
    let b:Area = x * y
    let c = x^2
    ```