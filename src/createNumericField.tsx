import * as React from 'react'
import type { BaseFieldProps, WrappedFieldProps } from 'redux-form'

type NumberNormalizer = (
  value?: (string | number) | null | undefined
) => (string | number) | null | undefined
const WHITESPACE = /^\s*$/

type AdditionalProps = { input: { onKeyDown: React.KeyboardEventHandler<any> } }

type InputProps = BaseFieldProps<AdditionalProps> & {
  normalizeOnBlur?: any
  normalizeNumber?: NumberNormalizer
}

export default function createNumericField(
  Field: React.ComponentType<BaseFieldProps<AdditionalProps>>
): React.ComponentType<InputProps> {
  function defaultNormalize(
    value?: (string | number) | null
  ): (string | number) | null | undefined {
    if (value == null || WHITESPACE.test(value as any)) return null
    if (typeof value === 'number') return value
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : value.trim()
  }

  return class NumericField extends React.Component<InputProps> {
    normalizeOnBlur = (value: any): any => {
      const { normalizeOnBlur } = this.props
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const result = normalizeNumber(value)
      return normalizeOnBlur ? normalizeOnBlur(result) : result
    }
    validate = (
      value: any,
      allValues: any,
      props: any,
      name: string
    ): string | null | undefined => {
      const normalizeNumber = this.props.normalizeNumber || defaultNormalize
      const normalized = normalizeNumber(value)
      if (typeof normalized === 'string' && !WHITESPACE.test(normalized)) {
        return 'must be a number'
      }
      const { validate } = this.props
      if (Array.isArray(validate)) {
        for (const validator of validate) {
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
    }: WrappedFieldProps & {
      onKeyDown?: React.KeyboardEventHandler<any>
    }): React.ReactElement => {
      const Comp = this.props.component as any
      return (
        <Comp
          {...props}
          input={input}
          onKeyDown={(event: React.KeyboardEvent<any>) => {
            const normalizeNumber =
              this.props.normalizeNumber || defaultNormalize

            if ((event as any).keyCode === 13) {
              input.onChange(normalizeNumber(input.value))
            }

            if (onKeyDown) onKeyDown(event)
          }}
        />
      )
    }

    render(): React.ReactElement {
      const {
        normalizeNumber, // eslint-disable-line @typescript-eslint/no-unused-vars
        component, // eslint-disable-line @typescript-eslint/no-unused-vars
        ...props
      } = this.props
      return (
        <Field
          {...(props as any)}
          validate={this.validate}
          normalizeOnBlur={this.normalizeOnBlur}
          component={this.KeyDownHandler}
        />
      )
    }
  }
}
