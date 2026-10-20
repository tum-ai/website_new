type Simplify<T> = { [K in keyof T]: T[K] } & {};

/**
 * `T` with every nullable field turned into an optional, non-null one.
 *
 * GROQ projects a missing field as `null`, and Sanity TypeGen types it as
 * `T | null`. Components take optional props (`image?: string`), so the fetch
 * layer drops the `null`s once (see `omitNulls`) and pages work with this
 * shape.
 */
export type WithoutNulls<T> = Simplify<
  {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
  } & {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
  }
>;

/** Shallow copy of `record` without its `null` fields. */
export function omitNulls<T extends object>(record: T): WithoutNulls<T> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== null),
  ) as WithoutNulls<T>;
}
