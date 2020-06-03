import React, { useEffect, useCallback, useState } from 'react'
import { SearchBox, Nav, getTheme } from '@fluentui/react'
import { useDispatch, useSelector } from 'react-redux'
import useSWR from 'swr'
import _ from 'lodash'

import { actions } from '@/stores'
import { runCommand } from '@/utils/fetcher'

const splitter = '/'

export function DatabaseNav() {
  const theme = getTheme()
  const {
    filter,
    database,
    collection,
    expandedDatabases,
    collectionsMap,
  } = useSelector((state) => state.root)
  const { data } = useSWR(`listDatabases/${JSON.stringify(filter)}`, () =>
    runCommand<{
      databases: {
        empty: boolean
        name: string
        sizeOnDisk: number
      }[]
    }>('admin', { listDatabases: 1, filter }),
  )
  const dispatch = useDispatch()
  const listCollections = useCallback(async (_database: string) => {
    const {
      cursor: { firstBatch },
    } = await runCommand<{ cursor: { firstBatch: { name: string }[] } }>(
      _database,
      {
        listCollections: 1,
      },
    )
    return firstBatch.map(({ name }) => name)
  }, [])
  const [databases, setDatabases] = useState<string[]>([])
  useEffect(() => {
    const _databases = data?.databases.map(({ name }) => name) || []
    const systemDatabases = _databases.filter(
      (d) => d === 'admin' || d === 'local',
    )
    setDatabases([
      ...systemDatabases.sort(),
      ..._.pullAll(_databases.sort(), systemDatabases),
    ])
  }, [data])
  useEffect(() => {
    Promise.all(
      expandedDatabases.map(async (_database) => {
        const collections = await listCollections(_database)
        const systemCollections = collections.filter((c) =>
          c.startsWith('system.'),
        )
        dispatch(
          actions.root.setCollectionsMap({
            database: _database,
            collections: [
              ...systemCollections.sort(),
              ..._.pullAll(collections.sort(), systemCollections),
            ],
          }),
        )
      }) || [],
    )
  }, [expandedDatabases, listCollections])

  return (
    <div
      style={{
        backgroundColor: theme.palette.neutralLighterAlt,
        width: 200,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <SearchBox
        autoFocus={true}
        placeholder="Search Database"
        styles={{ root: { margin: 10 } }}
        value={filter.name?.$regex}
        onChange={(_ev, newValue) => {
          dispatch(
            actions.root.setFilter(
              newValue ? { name: { $regex: newValue } } : {},
            ),
          )
        }}
      />
      <div
        style={{
          flex: 1,
          height: 0,
          overflowY: 'scroll',
        }}>
        <Nav
          groups={[
            {
              links: databases.length
                ? databases.map((_database) => ({
                    key: _database,
                    name: _database,
                    title: _database,
                    url: '',
                    isExpanded: expandedDatabases.includes(_database),
                    links: collectionsMap[_database]?.map((_collection) => ({
                      key: `${_database}${splitter}${_collection}`,
                      name: _collection,
                      title: _collection,
                      url: '',
                    })) || [
                      {
                        name: '...',
                        url: '',
                        disabled: true,
                      },
                    ],
                  }))
                : [
                    {
                      name: _.isEmpty(filter) ? '...' : 'No Database',
                      url: '',
                      disabled: true,
                    },
                  ],
            },
          ]}
          selectedKey={`${database}${splitter}${collection}`}
          onLinkClick={(_ev, item) => {
            if (!item?.links && item?.key) {
              const [_database, _collection] = item.key.split(splitter)
              if (database === _database && collection === _collection) {
                dispatch(actions.root.setDatabase(undefined))
                dispatch(actions.root.setCollection(undefined))
              } else {
                dispatch(actions.root.setDatabase(_database))
                dispatch(actions.root.setCollection(_collection))
              }
            }
          }}
          onLinkExpandClick={(_ev, item) => {
            if (item?.key) {
              dispatch(
                actions.root.setExpandedDatabases(
                  item.isExpanded
                    ? _.difference(expandedDatabases, [item.key])
                    : _.union(expandedDatabases, [item.key]),
                ),
              )
            }
          }}
        />
      </div>
    </div>
  )
}
