/**
 * The English dictionary is the source of truth for keys. Every other language is typed as
 * Widen<typeof en>: the same shape with free-form strings, so a missing or misspelt key in
 * the Punjabi file fails the build. "Every word translated" is enforced by the compiler.
 */
export type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : { readonly [K in keyof T]: Widen<T[K]> };
