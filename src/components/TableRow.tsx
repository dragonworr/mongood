/* eslint-disable react/no-danger */

import React, { useCallback, useMemo } from 'react'
import { HoverCard, HoverCardType, IColumn, getTheme } from '@fluentui/react'

import { MongoData, stringify } from '@/utils/mongo-shell-data'
import { useColorize } from '@/hooks/use-colorize'

function PlainCard(props: { value: MongoData }) {
  const str = useMemo(() => stringify(props.value, 2), [props.value])
  const html = useColorize(str)
  const theme = getTheme()

  return (
    <div
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        maxWidth: 500,
        maxHeight: 500,
        overflowY: 'scroll',
        backgroundColor: theme.palette.neutralLighterAlt,
      }}>
      <pre
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function TableRow<T extends { [key: string]: MongoData }>(props: {
  value: T
  column?: IColumn
}) {
  const theme = getTheme()
  const value = props.value[props.column?.key as keyof typeof props.value]
  const str = useMemo(() => stringify(value), [value])
  const html = useColorize(str.substr(0, 100))
  const onRenderPlainCard = useCallback(() => {
    return <PlainCard value={value} />
  }, [value])

  return str.length > 36 ? (
    <HoverCard
      type={HoverCardType.plain}
      plainCardProps={{
        onRenderPlainCard,
      }}
      styles={{
        host: {
          cursor: 'pointer',
          userSelect: 'none',
          color: theme.palette.neutralSecondary,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        },
      }}
      instantOpenOnClick={true}>
      <span
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </HoverCard>
  ) : (
    <span
      style={{
        verticalAlign: 'middle',
        cursor: 'default',
        userSelect: 'none',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
