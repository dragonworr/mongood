import React from 'react'
import { useSelector } from 'react-redux'

import { ServerStatus } from '@/components/ServerStatus'
import { CollectionStatus } from '@/components/CollectionStatus'

export default () => {
  const database = useSelector((state) => state.root.database)
  const collection = useSelector((state) => state.root.collection)

  return database && collection ? <CollectionStatus /> : <ServerStatus />
}
