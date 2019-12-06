// @flow

import * as React from 'react'
import type { FieldProps } from 'redux-form'
import type { Props as FieldInputProps } from 'redux-form/lib/FieldProps.types'

type NumberNormalizer = (value: ?(string | number)) => ?(string | number)
const WHITESPACE = /^\s*$/

function createNumericField(
  Field: React.ComponentType<FieldInputProps & { normalizeOnBlur?: Function }>
): React.ComponentType<
  FieldInputProps & {
    normalizeOnBlur?: Function,
    normalizeNumber?: NumberNormalizer,
  }
> {
  type Props = FieldInputProps & {
    normalizeOnBlur?: Function,
    normalizeNumber?: NumberNormalizer,
  }

  function defaultNormalize(value: ?(string | number)): ?(string | number) {
    if (value == null || WHITESPACE.test((value: any))) return null
    if (typeof value === 'number') return value
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : value.trim()
  }

  return class NumericField extends React.Component<Props> {
    normalizeOnBlur = (value: any): any => {
      const { normalizeOnBlur } = this.props
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const result = normalizeNumber(value)
      return normalizeOnBlur ? normalizeOnBlur(result) : result
    }

    validate = (
      value: any,
      allValues: any,
      props: Object,
      name: string
    ): ?string => {
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const normalized = normalizeNumber(value)
      if (typeof normalized === 'string' && !WHITESPACE.test(normalized)) {
        return 'must be a number'
      }
      const { validate } = this.props
      if (Array.isArray(validate)) {
        for (let validator of validate) {
          const result = validator(normalized, allValues, props, name)
          if (result) return result
        }
      } else if (validate) {
        return validate(normalized, allValues, props, name)
      }
    }

    KeyDownHandler = ({
      input,
      onKeyDown,
      ...props
    }: FieldProps & { onKeyDown?: (event: Event) => any }): React.Node => {
      const Comp = this.props.component
      return (
        <Comp
          {...props}
          input={input}
          onKeyDown={(event: Event) => {
            const normalizeNumber =
              this.props.normalizeNumber || defaultNormalize
            if ((event: any).keyCode === 13) {
              input.onChange(normalizeNumber(input.value))
            }
            if (onKeyDown) onKeyDown(event)
          }}
        />
      )
    }

    render(): React.Node {
      const {
        normalizeNumber, // eslint-disable-line no-unused-vars
        component, // eslint-disable-line no-unused-vars
        ...props
      } = this.props
      return (
        <Field
          {...(props: any)}
          validate={this.validate}
          normalizeOnBlur={this.normalizeOnBlur}
          component={this.KeyDownHandler}
        />
      )
    }
  }
}

module.exports = createNumericField
