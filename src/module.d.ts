/// <reference types="vite/client" />

declare module 'safer-eval' {
  function eval(code: string, context: object): any
  export = eval
}
