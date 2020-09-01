# SPM Dependencies Checker

This action process your `Package.swift` file to detect your **Swift Package Manager** dependencies, and compiles a list with all outdated ones.

## Usage

This action needs to run on **macOS** and requires [**actions/checkout**](https://github.com/actions/checkout) in order to function correctly.
A possible _workflow_ could be as following:

```yml
name:                     dependencies

on:
  schedule:
  - cron:                 "0 0 * * *"

jobs:
  dependencies:
    runs-on:              macos-latest

    steps:
    - uses:               actions/checkout@master
    - uses:               sbertix/spm-dependencies-checker@master
      with:
        language:         html  # optional. Defaults to `markdown`.
        excluding:        |     # optional. Packages you want to exclude.
          ComposableRequest
          @sbertix
```

### Inputs

<details><summary><strong>language</strong> (optional)</summary>
    <p>

An optional `string` holding either `html` or `txt` (otherwise `txt` is used), representing the language used for the `message` output.
    </p>
</details>

<details><summary><strong>excluding</strong> (optional)</summary>
    <p>

A `string` made of newline-separated components, either representing library names or authors (when starting with `@`) to exclude from the analysis.
    </p>
</details>

### Outputs

**message**

A plain (or HTML, depending on `language` _input_) `string` with outdated dependencies info.

<details><summary><code>txt</code></summary>
  <p>

```
https://github.com/sbertix/Swiftagram 4.0.0 -> 4.1.0 need(s) updating.
```
  </p>
</details>

<details><summary><code>html</code></summary>
  <p>

```html
<h3>Dependencies</h3>
<ul>
  <li>
    <a href='https://github.com/sbertix/Swiftagram'><strong>sbertix/Swiftagram</strong></a>
    <ul>
      <li><i>installed</i>: <code>4.0.0</code></li>
      <li><b>last</b>: <code>4.1.0</code></li>
    </ul>
  </li>
</ul>
```
  </p>
</details>

<details><summary><strong>outdated-dependencies</strong></summary>
    <p>

A `string` holding the _JSON representation_ of the `array` containing the list of all outdated dependencies.

```json
[
  {
    "name": "Swiftagram",
    "owner": "Sbertix",
    "url": "https://github.com/sbertix/Swiftagram",
    "installed": "4.0.0",
    "last": "4.1.2"
  }
]
```
  </p>
</details>
