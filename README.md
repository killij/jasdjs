# jasdjs - Just Another Sequence Diagrammer js

Generate a Sequence Diagram from a text representation.

For example:

```
title: An example

A -> B: This is a message
B -->> A: And this is a response
note over A: "Notes can be
over a lifeline"
note left of A: To the left
note right of A: Or to the right
A -> C: "It's easy to do
multiline text too"

note over A, C: Oh and notes can span over two lifelines too
```

<img src="images/example-1.png" width="350">

jasdjs is intended to allow you to create visually appealing documentation for your organisation.

Please see the [documentation](/docs/introduction.md) for full details.

jasdjs is designed to run in a browser.

## Installation

```npm install jasdjs```

## Getting started
This project is in its infancy atm, so please be patient.

## License
[MIT](LICENSE)
