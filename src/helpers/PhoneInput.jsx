import React from 'react'
import { Input } from '@vkontakte/vkui'
import { AsYouType } from 'libphonenumber-js'
import PropTypes from 'prop-types'
import { getInfoFromVKConnect } from './helpers'

function getPhoneInfo() {
  return getInfoFromVKConnect('VKWebAppGetPhoneNumber')
}

function format(string) {
  const formater = new AsYouType('RU')
  return formater.input(string)
}

function getPlainNumberredValue(value) {
  return value.replace(/[^0-9]/g, '')
}

function getPlainNumberredValueWithPlus(value) {
  return `+${getPlainNumberredValue(value)}`
}

function valueIsNice(value) {
  return getPlainNumberredValue(value).length <= 11
}

let state = {
  value: '',
  requestedPhone: false,
}

class PhoneInput extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  }

  static defaultProps = {
    placeholder: '',
    className: '',
  }

  constructor(props) {
    super(props)
    this.state = state
  }

  componentDidMount() {
    this.setState(state)
  }

  componentWillUnmount() {
    ;({ state } = this)
  }

  onChange({ target }) {
    this.changeValue(target.value)
  }

  async onClick() {
    const { requestedPhone } = this.state
    if (!requestedPhone) {
      this.setState({ requestedPhone: true })
      const { phone_number: phoneNumber } = await getPhoneInfo()
      this.changeValue(`+${phoneNumber}`)
    }
  }

  changeValue(value) {
    const { onChange } = this.props
    if (valueIsNice(value)) {
      const formattedValue = format(value)
      this.setState({ value: formattedValue })
      onChange(getPlainNumberredValueWithPlus(value))
    }
  }

  render() {
    const { className, placeholder } = this.props
    const { value } = this.state
    return (
      <Input
        type="tel"
        placeholder={format(placeholder)}
        onChange={(e) => this.onChange(e)}
        value={value}
        className={className}
        onClick={(e) => this.onClick(e)}
      />
    )
  }
}

export default PhoneInput
