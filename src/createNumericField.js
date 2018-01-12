// @flow

import * as React from 'react'
import type {FieldProps} from 'redux-form'

type NumberNormalizer = (value: ?(string | number)) => ?(string | number)
type Validator = (value: any, allValues: Object, props: Object) => ?any
const WHITESPACE = /^\s*$/


function createNumericField<P: {
  validate?: Validator | Array<Validator>,
  normalizeOnBlur?: Function,
  component: React.ElementType | Function | string,
}>(
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

    KeyDownHandler = ({input, onKeyDown, ...props}: FieldProps & {onKeyDown?: (event: Event) => any}): React.Node => {
      const Comp = this.props.component
      return (
        <Comp
          {...props}
          input={input}
          onKeyDown={(event: Event) => {
            const normalizeNumber = this.props.normalizeNumber || defaultNormalize
            if (event.keyCode === 13) {
              input.onChange(normalizeNumber(input.value))
            }
            if (onKeyDown) onKeyDown(event)
          }}
        />
      )
    }

    render(): React.Node {
      const {
        normalizeNumber, component, // eslint-disable-line no-unused-vars
        ...props
      } = this.props
      return (
        <Field
          {...props}
          validate={this.validate}
          normalizeOnBlur={this.normalizeOnBlur}
          component={this.KeyDownHandler}
        />
      )
    }
  }
}

module.exports = createNumericField