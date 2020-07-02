/**
 * @see https://docs.mongodb.com/manual/reference/mongodb-extended-json/#example
 */

import saferEval from 'safer-eval'
import _ from 'lodash'

function wrapKey(key: string) {
  const strKey = key.toString()
  if (strKey.includes('-') || strKey.includes('.') || /^\d/.test(strKey)) {
    return `"${key}"`
  }
  return key
}

export type MongoData =
  | string
  | number
  | boolean
  | undefined
  | null
  | { $oid: string }
  | {
      id: {
        '0': number
        '1': number
        '2': number
        '3': number
        '4': number
        '5': number
        '6': number
        '7': number
        '8': number
        '9': number
        '10': number
        '11': number
      }
    }
  | { $date: { $numberLong: string } }
  | { $numberDecimal: string }
  | { $numberDouble: string }
  | { $numberInt: string }
  | { $numberLong: string }
  | { $regularExpression: { pattern: string; options: string } }
  | { $timestamp: { t: number; i: number } }
  | { $binary: { base64: string; subType: string } }
  | object[]
  | object

export function stringify(val: MongoData, indent = 0, depth = 0): string {
  if (typeof val === 'string') {
    return JSON.stringify(val)
  }
  if (typeof val === 'number') {
    return val.toString()
  }
  if (typeof val === 'boolean') {
    return `${val}`
  }
  if (val === undefined) {
    return ''
  }
  if (val === null) {
    return 'null'
  }
  if ('$oid' in val) {
    return `ObjectId("${val.$oid}")`
  }
  if (
    'id' in val &&
    typeof val.id === 'object' &&
    '0' in val.id &&
    '1' in val.id &&
    '2' in val.id &&
    '3' in val.id &&
    '4' in val.id &&
    '5' in val.id &&
    '6' in val.id &&
    '7' in val.id &&
    '8' in val.id &&
    '9' in val.id &&
    '10' in val.id &&
    '11' in val.id
  ) {
    return `ObjectId("${Object.values(val.id)
      .map((n) => _.padStart(n.toString(16), 2, '0'))
      .join('')}")`
  }
  if ('$date' in val && '$numberLong' in val.$date) {
    return `ISODate("${new Date(
      parseInt(val.$date.$numberLong, 10),
    ).toISOString()}")`
  }
  if ('$numberDecimal' in val) {
    return `NumberDecimal("${val.$numberDecimal}")`
  }
  if ('$numberDouble' in val) {
    return val.$numberDouble
  }
  if ('$numberInt' in val) {
    return val.$numberInt
  }
  if ('$numberLong' in val) {
    return `NumberLong("${val.$numberLong}")`
  }
  if ('$regularExpression' in val) {
    return `/${val.$regularExpression.pattern}/${
      val.$regularExpression.options || ''
    }`
  }
  if ('$timestamp' in val) {
    return `Timestamp(${val.$timestamp.t}, ${val.$timestamp.i})`
  }
  if ('$binary' in val) {
    return `BinData(${parseInt(val.$binary.subType, 16)}, "${
      val.$binary.base64
    }")`
  }
  const spaces = _.repeat(' ', depth)
  if (Array.isArray(val)) {
    if (indent === 0) {
      return `[${val
        .map((v) => `${stringify(v, indent, depth + indent)}`)
        .join(', ')}]`
    }
    return val.length
      ? `[\n${val
          .map((v) => `  ${spaces}${stringify(v, indent, depth + indent)}`)
          .join(',\n')}\n${spaces}]`
      : '[]'
  }
  if (_.size(val) === 0) {
    return '{}'
  }
  if (indent === 0) {
    return `{ ${_.map(
      val,
      (value, key) =>
        `${wrapKey(key)}: ${stringify(value, indent, depth + indent)}`,
    ).join(', ')} }`
  }
  return `{\n${_.map(
    val,
    (value, key) =>
      `  ${spaces}${wrapKey(key)}: ${stringify(value, indent, depth + indent)}`,
  ).join(',\n')}\n${spaces}}`
}

export function parse(str: string): object | string {
  return JSON.parse(
    JSON.stringify(
      saferEval(str, {
        ObjectId: (s: string) => ({ $oid: s }),
        Date: (s: string | number) => ({
          $date: { $numberLong: new Date(s).getTime().toString() },
        }),
        ISODate: (s: string) => ({
          $date: { $numberLong: new Date(s).getTime().toString() },
        }),
        NumberDecimal: (s: string) => ({ $numberDecimal: s }),
        NumberInt: (s: string) => ({ $numberInt: s }),
        NumberLong: (s: string) => ({ $numberLong: s }),
        Timestamp: (t: number, i: number) => ({ $timestamp: { t, i } }),
        BinData: (subType: number, base64: string) => ({
          $binary: { base64, subType: subType.toString(16) },
        }),
      }),
      (_key, value) => {
        if (value instanceof RegExp) {
          return {
            $regularExpression: {
              pattern: value.source,
              options: value.flags,
            },
          }
        }
        return value
      },
    ),
  )
}
