# redux-form-numeric-field

[![Build Status](https://travis-ci.org/jcoreio/redux-form-numeric-field.svg?branch=master)](https://travis-ci.org/jcoreio/redux-form-numeric-field)
[![Coverage Status](https://codecov.io/gh/jcoreio/redux-form-numeric-field/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/redux-form-numeric-field)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A customized `redux-form` `Field` for entering numbers.  It isn't contrary; it won't stop you from typing, pasting, or cutting 
any characters.
When it loses focus it will normalize its value to a number, if valid; otherwise it will trim its value but leave it as a string,
and produce a "must be a number" validation error.

## Usage

```sh
npm install --save redux-form-numeric-field
```

```js
const {NumericField} = require('redux-form-numeric-field')
```
or
```js
const {NumericField} = require('redux-form-numeric-field/immutable')
```

## Example

The following field will trim its text when it loses focus:
```js
<NumericField
  name="name"
  component={YourInputComponent}
/>
```

## API

### `NumericField`

Has the same API as `redux-form`'s `Field`, but normalizes its value to a number when it loses focus
(unless the text is not a valid number, in which case it will just trim the text when it loses focus).

#### `normalizeNumber?: (value: ?(string | number)) => ?(string | number)`

Allows you to override the default implementation which is called on blur.  If `value` is a `number` or
correctly-formatted `string`, return a `number`; otherwise, return a `string` or `null`.

#### `normalizeOnBlur?: (value: ?(string | number)) => ?(string | number)`

If you provide this, it will be called with the output of `normalizeNumber`.

#### `validate?: Validator | Array<Validator>`

Unlike a normal `Field`, `NumericField` will call your validators with the normalized value from
`normalizeNumber`.  If its value is an invalid number but not whitespace, it will produce a
"must be a number" validation error without calling your own validators.
