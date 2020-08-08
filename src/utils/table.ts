/* eslint-disable no-bitwise */

import { sortBy } from 'lodash'

import { MongoData } from '@/types'
import { stringify } from './ejson'

export function calcHeaders<T extends { [key: string]: MongoData }>(
  items: T[],
  order?: string[],
): { key: string; minWidth: number }[] {
  const keys: { [key: string]: { order: number; minWidth: number } } = {}
  items.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (!keys[key] && order) {
        const index = order.indexOf(key)
        keys[key] = {
          order: index >= 0 ? (order.length - index) << 10 : 0,
          minWidth: Math.max(
            100,
            Math.min(240, stringify(item[key]).length << 3),
          ),
        }
      }
      keys[key].order += 1
    })
  })
  return sortBy(Object.entries(keys), (k) => k[1].order)
    .reverse()
    .map(([k, { minWidth }]) => ({ key: k, minWidth }))
}
