import * as React from 'react'
import { describe, it } from 'mocha'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { expect } from 'chai'
import { render, fireEvent } from '@testing-library/react'
import { reduxForm, reducer, WrappedFieldProps } from 'redux-form'
import {
  reduxForm as immutableReduxForm,
  reducer as immutableReducer,
} from 'redux-form/immutable'
import { NumericField } from '../src'
import { NumericField as ImmutableNumericField } from '../src/immutable'

const Input = ({
  input: inputProps,
  ...props
}: WrappedFieldProps): React.ReactElement => (
  <input {...inputProps} {...props} />
)

function min(threshold: number): (value: number) => string | null | undefined {
  return (value: number) => {
    if (value < threshold) return `must be >= ${threshold}`
  }
}

function max(threshold: number): (value: number) => string | null | undefined {
  return (value: number) => {
    if (value > threshold) return `must be <= ${threshold}`
  }
}

describe('NumericField', () => {
  function tests({
    NumericField,
    reducer,
    reduxForm,
    getValue = (state: any, form: string, field: string) =>
      state.form[form].values?.[field],
    getSyncError = (state: any, form: string, field: string) =>
      state.form[form].syncErrors?.[field],
  }: any) {
    it('normalizes valid number on blur', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField name="hello" component={Input} />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )
      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '  23  ' } })
      expect(input.value).to.equal('  23  ')
      fireEvent.blur(input)
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(23)
      expect(input.value).to.equal('23')
      expect(getSyncError(store.getState(), 'form', 'hello')).not.to.exist
    })
    it('preserves invalid text on blur', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField name="hello" component={Input} />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '  23a  ' } })
      expect(input.value).to.equal('  23a  ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal('  23a  ')
      fireEvent.blur(input)
      expect(input.value).to.equal('23a')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal('23a')
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be a number'
      )
    })
    it('tolerates whitespace', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField name="hello" component={Input} />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '   ' } })
      expect(getValue(store.getState(), 'form', 'hello')).to.equal('   ')
      expect(input.value).to.equal('   ')
      expect(getSyncError(store.getState(), 'form', 'hello')).not.to.exist
      fireEvent.blur(input)
      expect(input.value).to.equal('')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(null)
      expect(getSyncError(store.getState(), 'form', 'hello')).not.to.exist
    })
    it('supports single validate function', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField name="hello" component={Input} validate={min(30)} />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: ' 23 ' } })
      expect(input.value).to.equal(' 23 ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23 ')
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be >= 30'
      )
      fireEvent.blur(input)
      expect(input.value).to.equal('23')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(23)
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be >= 30'
      )

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: ' 23a ' } })
      expect(input.value).to.equal(' 23a ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23a ')
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be a number'
      )
    })
    it('supports validate function array', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))
      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            validate={[min(30), max(50)]}
          />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, {
        target: {
          value: ' 23 ',
        },
      })
      expect(input.value).to.equal(' 23 ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23 ')
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be >= 30'
      )
      fireEvent.blur(input)
      expect(input.value).to.equal('23')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(23)
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be >= 30'
      )

      fireEvent.focus(input)
      fireEvent.change(input, {
        target: {
          value: ' 52 ',
        },
      })
      expect(input.value).to.equal(' 52 ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 52 ')
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be <= 50'
      )
      fireEvent.blur(input)
      expect(input.value).to.equal('52')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(52)
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be <= 50'
      )

      fireEvent.focus(input)
      fireEvent.change(input, {
        target: {
          value: ' 23a ',
        },
      })
      expect(getSyncError(store.getState(), 'form', 'hello')).to.equal(
        'must be a number'
      )
      expect(input.value).to.equal(' 23a ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23a ')
    })
    it('supports additional normalizeOnBlur function', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            normalizeOnBlur={(value: number) => Math.round(value)}
          />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, {
        target: {
          value: ' 23.4 ',
        },
      })
      expect(input.value).to.equal(' 23.4 ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23.4 ')
      fireEvent.blur(input)
      expect(input.value).to.equal('23')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(23)
    })
    it('supports custom normalizeNumber function', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            normalizeNumber={(value: number) => Number(value) * 2}
          />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: ' 23.4 ' } })
      expect(input.value).to.equal(' 23.4 ')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(' 23.4 ')
      fireEvent.blur(input)
      expect(input.value).to.equal('46.8')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(46.8)
    })
    it('normalizes when enter is pressed', () => {
      const store = createStore<any, any>(combineReducers({ form: reducer }))

      const Form = reduxForm({ form: 'form' })(() => (
        <form>
          <NumericField name="hello" component={Input} />
        </form>
      ))

      const comp = render(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      const input = comp.container.querySelector('input')
      if (!input) throw new Error('failed to find input element')

      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: ' 23.4 ' } })
      fireEvent.keyDown(input, { keyCode: 13 })
      expect(input.value).to.equal('23.4')
      expect(getValue(store.getState(), 'form', 'hello')).to.equal(23.4)
    })
  }

  describe('pojo', () => tests({ NumericField, reducer, reduxForm }))
  describe('immutable', () =>
    tests({
      NumericField: ImmutableNumericField,
      reducer: immutableReducer,
      reduxForm: immutableReduxForm,
      getValue: (state: any, form: string, field: string) =>
        state.form.getIn([form, 'values', field]),
      getSyncError: (state: any, form: string, field: string) =>
        state.form.getIn([form, 'syncErrors', field]),
    }))
})
