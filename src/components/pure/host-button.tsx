import React, { useMemo, useEffect } from 'react'
import { DefaultButton, IContextualMenuItem, IStyle } from '@fluentui/react'
import { useCommandIsMaster } from 'hooks/use-command'

export function HostButton(props: {
  host?: string
  setHost(host: string): void
  style?: IStyle
}) {
  const { data: replicaConfig } = useCommandIsMaster()
  const hosts = useMemo<string[]>(
    () => replicaConfig?.hosts || [],
    [replicaConfig],
  )
  useEffect(() => {
    if (!props.host || !hosts.includes(props.host)) {
      props.setHost(hosts[0])
    }
  }, [hosts, props])
  const items = useMemo<IContextualMenuItem[]>(
    () =>
      hosts.map((h) => ({
        key: h,
        text: h,
        secondaryText: h === replicaConfig?.primary ? 'Primary' : 'Secondary',
        checked: h === props.host,
        canCheck: true,
        onClick() {
          props.setHost(h)
        },
      })),
    [hosts, replicaConfig?.primary, props],
  )

  return (
    <DefaultButton
      disabled={hosts.length === 0}
      styles={{ root: props.style }}
      menuProps={{
        items,
      }}
      menuIconProps={{ hidden: true }}>
      {props.host || 'No Host'}
    </DefaultButton>
  )
}
