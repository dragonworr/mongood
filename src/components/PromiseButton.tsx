import React, { useState, useEffect } from 'react'
import {
  DefaultButton,
  Dialog,
  IStyle,
  DialogType,
  getTheme,
  DialogFooter,
  IconButton,
} from '@fluentui/react'

import { usePromise } from '@/hooks/use-promise'

export function PromiseButton(props: {
  icon?: string
  text?: string
  disabled?: boolean
  primary?: boolean
  promise: ReturnType<typeof usePromise>
  silent?: boolean
  style?: IStyle
}) {
  const theme = getTheme()
  const [hidden, setHidden] = useState(true)
  const { rejected, pending, call, reset } = props.promise
  useEffect(() => {
    if (rejected) {
      setHidden(false)
    }
  }, [rejected])

  return (
    <>
      {props.silent ? null : (
        <Dialog
          hidden={hidden}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Error',
            subText: rejected?.message,
            showCloseButton: true,
          }}
          modalProps={{
            styles: {
              main: {
                minHeight: 0,
                borderTop: `4px solid ${theme.palette.red}`,
                backgroundColor: theme.palette.neutralLighterAlt,
              },
            },
            onDismiss() {
              setHidden(true)
            },
            onDismissed() {
              reset()
            },
          }}>
          <DialogFooter>
            <DefaultButton
              onClick={() => {
                setHidden(true)
              }}
              text="OK"
            />
          </DialogFooter>
        </Dialog>
      )}
      {props.text ? (
        <DefaultButton
          text={props.text}
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || pending}
          primary={props.primary}
          onClick={call}
          styles={{ root: props.style }}
        />
      ) : (
        <IconButton
          iconProps={{ iconName: props.icon }}
          disabled={props.disabled || pending}
          primary={props.primary}
          onClick={call}
          styles={{ root: props.style }}
        />
      )}
    </>
  )
}
