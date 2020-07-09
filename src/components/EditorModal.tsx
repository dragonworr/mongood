import { Modal, IconButton, getTheme, Text } from '@fluentui/react'
import React, { useState, useEffect, useCallback } from 'react'
import { KeyCode } from 'monaco-editor'
import { EditorDidMount } from '@monaco-editor/react'

import { stringify, parse } from '@/utils/ejson'
import { ControlledEditor } from '@/utils/editor'
import { useDarkMode } from '@/hooks/use-dark-mode'

export function EditorModal<T extends object>(props: {
  title: string
  readOnly?: boolean
  value?: T
  onChange?(value: T): void
  isOpen: boolean
  onDismiss(): void
  footer?: React.ReactNode
}) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const [value, setValue] = useState('')
  useEffect(() => {
    setValue(`return ${stringify(props.value, 2)}\n`)
  }, [props.value])
  const handleEditorDidMount = useCallback<EditorDidMount>(
    (_getEditorValue, editor) => {
      editor.onKeyDown((e) => {
        if (e.keyCode === KeyCode.Escape) {
          e.stopPropagation()
        }
      })
    },
    [],
  )

  return (
    <>
      <Modal
        styles={{
          scrollableContent: {
            minWidth: 800,
            minHeight: 600,
            width: '80vw',
            height: '80vh',
            borderTop: `4px solid ${theme.palette.themePrimary}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.neutralLighterAlt,
          },
        }}
        isOpen={props.isOpen}
        onDismiss={props.onDismiss}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 10,
            paddingLeft: 20,
          }}>
          <Text
            variant="xLarge"
            block={true}
            styles={{
              root: {
                alignItems: 'center',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              },
            }}>
            {props.title}
          </Text>
          <IconButton
            styles={{ root: { marginLeft: 10 } }}
            iconProps={{ iconName: 'Cancel' }}
            onClick={props.onDismiss}
          />
        </div>
        <div
          style={{ flex: 1 }}
          onBlur={() => {
            try {
              props.onChange?.(parse(value.replace(/^return/, '')) as T)
              // eslint-disable-next-line no-empty
            } catch {}
          }}>
          <ControlledEditor
            language="typescript"
            value={value}
            onChange={(_ev, _value) => {
              setValue(_value || '')
            }}
            theme={isDarkMode ? 'vs-dark' : 'vs'}
            editorDidMount={handleEditorDidMount}
            options={{
              readOnly: props.readOnly,
              wordWrap: 'on',
              contextmenu: false,
              scrollbar: { verticalScrollbarSize: 0, horizontalSliderSize: 0 },
            }}
          />
        </div>
        {props.footer ? (
          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row-reverse',
              padding: 10,
            }}>
            {props.footer}
          </div>
        ) : null}
      </Modal>
    </>
  )
}
