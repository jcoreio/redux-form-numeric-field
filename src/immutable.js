/* @flow */

import * as React from 'react'
import { Field as _Field } from 'redux-form-normalize-on-blur/immutable'
import createNumericField from './createNumericField'

const NumericField = createNumericField<React.ElementConfig<typeof _Field>>(
  _Field
)

export { NumericField, createNumericField }
