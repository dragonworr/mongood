import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Dropdown, Label, Stack, TooltipHost } from '@fluentui/react'
import { ControlledEditorProps } from '@monaco-editor/react'

import { runCommand } from '@/utils/fetcher'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'
import { stringify, parse } from '@/utils/ejson'
import { LargeMessage } from '@/components/LargeMessage'
import { generateMongoJsonSchema } from '@/utils/schema'
import { MongoData, ValidationAction, ValidationLevel } from '@/types'
import { useCommandListCollections } from '@/hooks/use-command'
import { PromiseButton } from '@/components/PromiseButton'
import { usePromise } from '@/hooks/use-promise'
import { Divider } from '@/components/Divider'
import { TAB_SIZE_KEY } from './settings'

export default () => {
  const connection = useSelector((state) => state.root.connection)
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)
  const { data, revalidate } = useCommandListCollections()
  const isDarkMode = useDarkMode()
  const [
    validationAction,
    setValidationAction,
  ] = useState<ValidationAction | null>(null)
  const [
    validationLevel,
    setValidationLevel,
  ] = useState<ValidationLevel | null>(null)
  const [value, setValue] = useState('')
  const handleSave = useCallback(
    async () =>
      database && collection
        ? runCommand(connection, database, {
            collMod: collection,
            validationAction,
            validationLevel,
            validator: {
              $jsonSchema: parse(value.replace(/^return/, '')),
            },
          })
        : undefined,
    [
      connection,
      database,
      collection,
      value,
      validationAction,
      validationLevel,
    ],
  )
  const promiseSave = usePromise(handleSave)
  useEffect(() => {
    if (promiseSave.resolved) {
      revalidate()
    }
  }, [promiseSave.resolved, revalidate])
  useEffect(() => {
    if (!data?.cursor.firstBatch[0]) {
      return
    }
    const { options } = data.cursor.firstBatch[0]
    const str = stringify(options.validator?.$jsonSchema, true)
    setValidationAction(options.validationAction || null)
    setValidationLevel(options.validationLevel || null)
    setValue(str ? `return ${str}` : 'return {}')
  }, [data])
  const handleChange = useCallback((_ev: unknown, _value?: string) => {
    setValue(_value || '')
  }, [])
  const options = useMemo<ControlledEditorProps['options']>(
    () => ({
      tabSize: parseInt(localStorage.getItem(TAB_SIZE_KEY) || '2', 10),
      wordWrap: 'on',
      contextmenu: false,
      scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
    }),
    [],
  )
  const handleGenerate = useCallback(async () => {
    if (!database || !collection) {
      return undefined
    }
    const {
      cursor: { firstBatch },
    } = await runCommand<{
      cursor: {
        firstBatch: MongoData[]
      }
    }>(connection, database, { find: collection }, { canonical: true })
    return stringify(generateMongoJsonSchema(firstBatch), true)
  }, [collection, connection, database])
  const promiseGenerate = usePromise(handleGenerate)
  useEffect(() => {
    const str = promiseGenerate.resolved
    if (str !== undefined) {
      setValue(str ? `return ${str}` : 'return {}')
      if (!validationAction) {
        setValidationAction(ValidationAction.WARN)
      }
      if (!validationLevel) {
        setValidationLevel(ValidationLevel.OFF)
      }
    }
  }, [promiseGenerate.resolved, validationAction, validationLevel])

  if (!database || !collection) {
    return <LargeMessage iconName="Back" title="Select Collection" />
  }
  return (
    <>
      <ControlledEditor
        language="typescript"
        theme={isDarkMode ? 'vs-dark' : 'vs'}
        value={value}
        onChange={handleChange}
        options={options}
      />
      <Divider />
      <Stack
        horizontal={true}
        tokens={{ padding: 10 }}
        styles={{
          root: {
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        }}>
        <Label styles={{ root: { marginRight: 10 } }}>Validation action:</Label>
        <Dropdown
          selectedKey={validationAction}
          onChange={(_ev, option) => {
            setValidationAction(option?.key as ValidationAction | null)
          }}
          errorMessage={value && !validationAction ? ' ' : undefined}
          styles={{ root: { marginRight: 10, width: 140, height: 32 } }}
          options={[
            { key: ValidationAction.WARN, text: ValidationAction.WARN },
            { key: ValidationAction.ERROR, text: ValidationAction.ERROR },
          ]}
          placeholder="please select"
        />
        <Label styles={{ root: { marginLeft: 20, marginRight: 10 } }}>
          Validation level:
        </Label>
        <Dropdown
          selectedKey={validationLevel}
          onChange={(_ev, option) => {
            setValidationLevel(option?.key as ValidationLevel | null)
          }}
          errorMessage={value && !validationLevel ? ' ' : undefined}
          styles={{ root: { width: 140, height: 32 } }}
          options={[
            { key: ValidationLevel.OFF, text: ValidationLevel.OFF },
            { key: ValidationLevel.MODERATE, text: ValidationLevel.MODERATE },
            { key: ValidationLevel.STRICT, text: ValidationLevel.STRICT },
          ]}
          placeholder="please select"
        />
        <Stack.Item grow={true}>
          <div />
        </Stack.Item>
        <TooltipHost content="Auto generate schema">
          <PromiseButton icon="AutoEnhanceOn" promise={promiseGenerate} />
        </TooltipHost>
        <PromiseButton
          icon="CheckMark"
          disabled={!validationAction || !validationLevel || !value}
          promise={promiseSave}
        />
      </Stack>
    </>
  )
}
