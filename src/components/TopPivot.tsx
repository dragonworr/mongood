import React, { useEffect, useCallback, useState } from 'react'
import { Pivot, PivotItem, getTheme, CommandButton } from '@fluentui/react'
import { useHistory } from 'umi'
import useSWR from 'swr'
import { useSelector, useDispatch } from 'react-redux'
import useAsyncEffect from 'use-async-effect'
import _ from 'lodash'

import { listConnections, runCommand } from '@/utils/fetcher'
import { actions } from '@/stores'
import { ServerStats } from '@/types'

export function TopPivot() {
  const { connection } = useSelector((state) => state.root)
  const dispatch = useDispatch()
  const history = useHistory()
  const theme = getTheme()
  const { data } = useSWR('connections', listConnections)
  const serverStatus = useCallback(
    async (_connection: string) =>
      runCommand<ServerStats>(_connection, 'admin', {
        serverStatus: 1,
      }),
    [],
  )
  const [connections, setConnections] = useState<
    { c: string; host: string; replSetName?: string }[]
  >([])
  useAsyncEffect(async () => {
    setConnections(
      _.compact(
        await Promise.all(
          data?.map(async (c) => {
            try {
              const { host, repl } = await serverStatus(c)
              return { c, host, replSetName: repl?.setName }
            } catch {
              return { c, host: c }
            }
          }) || [],
        ),
      ),
    )
  }, [data, serverStatus])
  useEffect(() => {
    if (data?.length && !connection) {
      dispatch(actions.root.setConnection(data[0]))
    }
  }, [data, connection])

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLight,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
        flexShrink: 0,
      }}>
      <Pivot
        selectedKey={history.location.pathname}
        onLinkClick={(link) => {
          history.push(link?.props.itemKey || '/')
        }}>
        <PivotItem headerText="Stats" itemKey="/stats" />
        <PivotItem headerText="Documents" itemKey="/documents" />
        <PivotItem headerText="Indexes" itemKey="/indexes" />
        <PivotItem headerText="Operations" itemKey="/operations" />
        <PivotItem headerText="Profiling" itemKey="/profiling" />
        <PivotItem headerText="Schema" itemKey="/schema" />
        <PivotItem headerText="Users" itemKey="/users" />
        <PivotItem headerText="Notebook (Alpha)" itemKey="/notebook" />
      </Pivot>
      <CommandButton
        text={connections.find(({ c }) => c === connection)?.host}
        menuIconProps={{ iconName: 'Database' }}
        styles={{
          menuIcon: {
            color: theme.palette.themePrimary,
          },
        }}
        menuProps={{
          items: connections.map(({ c, host, replSetName }) => ({
            key: c,
            text: host,
            secondaryText: replSetName,
            canCheck: true,
            checked: connection === c,
            onClick() {
              dispatch(actions.root.setConnection(c))
            },
          })),
        }}
      />
    </div>
  )
}
