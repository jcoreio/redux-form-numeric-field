// @flow

import * as React from 'react'

type NumberNormalizer = (value: ?(string | number)) => ?(string | number)
type Validator = (value: any, allValues: Object, props: Object) => ?any
const WHITESPACE = /^\s*$/

function createNumericField<P: {validate?: Validator | Array<Validator>, normalizeOnBlur?: Function}>(
  Field: React.ComponentType<P>
): React.ComponentType<P & {normalizeNumber?: NumberNormalizer}> {
  type Props = React.ElementProps<typeof Field> & {normalizeNumber?: NumberNormalizer}

  function defaultNormalize(value: ?(string | number)): ?(string | number) {
    if (value == null || typeof value === 'number' || WHITESPACE.test(value)) {
      return typeof value === 'string' ? value.trim() : value
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : value.trim()
  }

  return class NumericField extends React.Component<Props> {
    normalizeOnBlur = (value: any): any => {
      const {normalizeOnBlur} = this.props
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const result = normalizeNumber(value)
      return normalizeOnBlur ? normalizeOnBlur(result) : result
    }

    validate = (value: any, allValues: Object, props: Object): ?string => {
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const normalized = normalizeNumber(value)
      if (typeof normalized === 'string') {
        if (WHITESPACE.test(normalized)) return
        return 'must be a number'
      }
      const {validate} = this.props
      if (Array.isArray(validate)) {
        for (let validator of validate) {
          const result = validator(normalized, allValues, props)
          if (result) return result
        }
      } else if (validate) {
        return validate(normalized, allValues, props)
      }
    }

    render(): React.Node {
      const {
        normalizeNumber, // eslint-disable-line no-unused-vars
        ...props
      } = this.props
      return (
        <Field
          {...props}
          validate={this.validate}
          normalizeOnBlur={this.normalizeOnBlur}
        />
      )
    }
  }
}

module.exports = createNumericField
