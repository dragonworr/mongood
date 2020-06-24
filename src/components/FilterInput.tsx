import { TextField, IIconProps } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'

import { parse, stringify } from '@/utils/mongo-shell-data'

export function FilterInput<T extends string | object | undefined>(props: {
  autoFocus?: boolean
  disabled?: boolean
  prefix?: string
  iconProps?: IIconProps
  value?: T
  onChange(value: T): void
}) {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(stringify(props.value))
  }, [props.value])
  const handleChange = useCallback(() => {
    try {
      props.onChange((value ? parse(value) : undefined) as T)
    } catch (err) {
      setErrorMessage(' ')
    }
  }, [value])

  return (
    <TextField
      autoFocus={props.autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      autoSave="off"
      spellCheck={false}
      styles={{
        root: { flex: 1 },
        prefix: { cursor: 'default' },
      }}
      disabled={props.disabled}
      prefix={props.prefix}
      iconProps={props.iconProps}
      errorMessage={errorMessage}
      value={value}
      onBlur={handleChange}
      onKeyDown={(ev) => {
        if (ev.key === 'Enter') {
          handleChange()
        }
      }}
      onChange={(_ev, newValue) => {
        setValue(newValue || '')
        setErrorMessage(undefined)
      }}
    />
  )
}
