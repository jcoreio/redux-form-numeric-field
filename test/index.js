// @flow

import * as React from 'react'
import {describe, it} from 'mocha'
import {createStore, combineReducers} from 'redux'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'
import {expect} from 'chai'
import {reduxForm, reducer} from 'redux-form'
import {reduxForm as immutableReduxForm, reducer as immutableReducer} from 'redux-form/immutable'

import {NumericField} from '../src'
import {NumericField as ImmutableNumericField} from '../src/immutable'

const Input = ({input: inputProps, ...props}): React.Node => <input {...inputProps} {...props} />

function min(threshold: number): (value: number) => ?string {
  return (value: number) => {
    if (value < threshold) return `must be >= ${threshold}`
  }
}

function max(threshold: number): (value: number) => ?string {
  return (value: number) => {
    if (value > threshold) return `must be <= ${threshold}`
  }
}

describe('NumericField', () => {
  function tests({NumericField, reducer, reduxForm}: any) {
    it('normalizes valid number on blur', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: '  23  '}})
      expect(comp.update().find('input').prop('value')).to.equal('  23  ')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(23)
    })
    it('preserves invalid text on blur', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: '  23a  '}})
      expect(comp.update().find('input').prop('value')).to.equal('  23a  ')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal('23a')
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be a number')
    })
    it('tolerates whitespace', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: '   '}})
      expect(comp.update().find('input').prop('value')).to.equal('   ')
      expect(comp.update().find(Input).prop('meta').error).not.to.exist
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal('')
      expect(comp.update().find(Input).prop('meta').error).not.to.exist
    })
    it('supports single validate function', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            validate={min(30)}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23 '}})
      expect(comp.update().find('input').prop('value')).to.equal(' 23 ')
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be >= 30')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(23)
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be >= 30')

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23a '}})
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be a number')
    })
    it('supports validate function array', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            validate={[min(30), max(50)]}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23 '}})
      expect(comp.update().find('input').prop('value')).to.equal(' 23 ')
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be >= 30')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(23)
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be >= 30')

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 52 '}})
      expect(comp.update().find('input').prop('value')).to.equal(' 52 ')
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be <= 50')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(52)
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be <= 50')

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23a '}})
      expect(comp.update().find(Input).prop('meta').error).to.equal('must be a number')
    })
    it('supports additional normalizeOnBlur function', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            normalizeOnBlur={value => Math.round(value)}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23.4 '}})
      expect(comp.update().find('input').prop('value')).to.equal(' 23.4 ')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(23)
    })
    it('supports custom normalizeNumber function', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
            normalizeNumber={value => Number(value) * 2}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23.4 '}})
      expect(comp.update().find('input').prop('value')).to.equal(' 23.4 ')
      comp.update().find(Input).simulate('blur')
      expect(comp.update().find('input').prop('value')).to.equal(46.8)
    })
    it('normalizes when enter is pressed', () => {
      const store = createStore(combineReducers({form: reducer}))

      const Form = reduxForm({form: 'form'})(() => (
        <form>
          <NumericField
            name="hello"
            component={Input}
          />
        </form>
      ))

      const comp = mount(
        <Provider store={store}>
          <Form />
        </Provider>
      )

      comp.find(Input).simulate('focus')
      comp.find(Input).simulate('change', {target: {value: ' 23.4 '}})
      comp.update().find(Input).simulate('keydown', {keyCode: 13})
      expect(comp.update().find('input').prop('value')).to.equal(23.4)
    })
  }
  describe('pojo', () => tests({NumericField, reducer, reduxForm}))
  describe('immutable', () => tests({
    NumericField: ImmutableNumericField,
    reducer: immutableReducer,
    reduxForm: immutableReduxForm
  }))
})
