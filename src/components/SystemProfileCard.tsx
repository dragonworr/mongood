/* eslint-disable react/no-danger */

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  CompoundButton,
  HoverCard,
  HoverCardType,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'

import { SystemProfileDoc, ExecStats } from '@/types'
import { stringify } from '@/utils/mongo-shell-data'
import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'
import { Number } from '@/utils/formatter'
import { SystemProfileModal } from './SystemProfileModal'

function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const str = useMemo(
    () => stringify(_.omit(props.value, ['inputStage', 'inputStages']), 2),
    [props.value],
  )
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str, isDarkMode).then(setHtml)
  }, [str, isDarkMode])
  const onRenderPlainCard = useCallback(() => {
    return <pre dangerouslySetInnerHTML={{ __html: html }} />
  }, [html])

  return (
    <>
      <HoverCard
        type={HoverCardType.plain}
        plainCardProps={{ onRenderPlainCard }}
        styles={{
          host: {
            display: 'inherit',
            cursor: 'pointer',
          },
        }}
        instantOpenOnClick={true}>
        <CompoundButton
          styles={{
            description: {
              whiteSpace: 'pre-wrap',
              lineHeight: '1.2em',
            },
            root: {
              paddingTop: 10,
              paddingBottom: 10,
              minHeight: 'unset',
              height: 'fit-content',
            },
          }}
          secondaryText={_.compact([
            `${
              props.value.executionTimeMillisEstimate -
              (props.value.inputStage?.executionTimeMillisEstimate || 0)
            } ms`,
            props.value.docsExamined === undefined
              ? undefined
              : `${Number.format(props.value.docsExamined)} docs examined`,
            props.value.keysExamined === undefined
              ? undefined
              : `${Number.format(props.value.keysExamined)} keys examined`,
            props.value.nMatched === undefined
              ? undefined
              : `${Number.format(props.value.nMatched)} matched`,
            props.value.memUsage === undefined
              ? undefined
              : `${bytes(props.value.memUsage, {
                  unitSeparator: ' ',
                }).toLocaleLowerCase()} mem used`,
            `${props.value.nReturned} returned`,
          ]).join('\n')}>
          {props.value.stage}
        </CompoundButton>
      </HoverCard>
      {props.value.inputStage ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                margin: 8,
              },
            }}
          />
          <ExecStage value={props.value.inputStage} />
        </>
      ) : null}
      {props.value.inputStages ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                margin: 8,
              },
            }}
          />
          {props.value.inputStages.map((inputStage, index) => (
            <>
              {index === 0 ? null : (
                <Icon
                  iconName="Pause"
                  styles={{
                    root: {
                      color: theme.palette.neutralPrimary,
                      margin: 8,
                    },
                  }}
                />
              )}
              <ExecStage value={inputStage} />
            </>
          ))}
        </>
      ) : null}
    </>
  )
}

export function SystemProfileCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      onDoubleClick={() => {
        setIsOpen(true)
      }}
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          marginBottom: 10,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        maxWidth: 'unset',
        minHeight: 'unset',
      }}>
      <Card.Item>
        <SystemProfileModal
          value={props.value}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false)
          }}
        />
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {_.tail(props.value.ns.split('.')).join('.')}
        </Text>
        &nbsp;
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.value.op}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="large"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {_.compact([
            `${props.value.millis} ms`,
            props.value.docsExamined === undefined
              ? undefined
              : `${Number.format(props.value.docsExamined)} docs examined`,
            props.value.keysExamined === undefined
              ? undefined
              : `${Number.format(props.value.keysExamined)} keys examined`,
            props.value.nreturned === undefined
              ? undefined
              : `${Number.format(props.value.nreturned)} returned`,
          ]).join(', ')}
        </Text>
      </Card.Item>
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            flexDirection: 'row-reverse',
            flexWrap: 'wrap',
            width: 'fit-content',
          },
        }}>
        {props.value.execStats ? (
          <ExecStage value={props.value.execStats} />
        ) : null}
      </Card.Item>
    </Card>
  )
}
