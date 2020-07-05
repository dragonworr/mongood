/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import vm from 'vm'

import { sandbox } from './ejson'

function Cursor(obj: any = {}) {
  return {
    skip(skip: number) {
      obj.skip = skip
      return this
    },
    limit(limit: number) {
      obj.limit = limit
      return this
    },
    sort(sorter: object) {
      obj.sort = sorter
      return this
    },
    hint(hint: object | string) {
      obj.hint = hint
      return this
    },
    project(projection: object) {
      obj.projection = projection
      return this
    },
    explain() {
      return {
        explain: obj,
      }
    },
    toArray() {
      return obj
    },
  }
}

function Collection(collection: string) {
  return {
    find(filter?: object) {
      return Cursor({
        find: collection,
        filter,
        limit: 10,
      })
    },
    findOne(filter?: object) {
      return {
        find: collection,
        filter,
        limit: 1,
      }
    },
    insertOne(doc: object) {
      return {
        insert: collection,
        documents: [doc],
      }
    },
    insertMany(docs: object[]) {
      return {
        insert: collection,
        documents: docs,
      }
    },
    updateOne(
      filter: object,
      update: object,
      options: { upsert?: boolean } = {},
    ) {
      return {
        update: collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: false,
          },
        ],
      }
    },
    updateMany(
      filter: object,
      update: object,
      options: { upsert?: boolean } = {},
    ) {
      return {
        update: collection,
        updates: [
          {
            q: filter,
            u: update,
            upsert: options.upsert,
            multi: true,
          },
        ],
      }
    },
    deleteOne(filter: object) {
      return {
        delete: collection,
        deletes: [
          {
            q: filter,
            limit: 1,
          },
        ],
      }
    },
    deleteMany(filter: object) {
      return {
        delete: collection,
        deletes: [
          {
            q: filter,
            limit: 0,
          },
        ],
      }
    },
    getIndexes() {
      return {
        listIndexes: collection,
      }
    },
  }
}

const context = vm.createContext({
  ...sandbox,
  db: new Proxy(
    {},
    {
      get(_target, name) {
        return Collection(name as string)
      },
    },
  ),
})

export function toCommand(str: string): object {
  return vm.runInContext(str, context)
}
