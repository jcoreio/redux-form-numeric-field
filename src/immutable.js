/* @flow */

import {Field as _Field} from 'redux-form-normalize-on-blur/immutable'
import createNumericField from './createNumericField'

const NumericField = createNumericField(_Field)

export {NumericField, createNumericField}

