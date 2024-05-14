import { type ReadonlyJSONValue } from "replicache";

/** Removes undefined value, and joins string to '/' */
function constructIDBKey(arr: (string | null | undefined | number)[]) {
  return arr.filter((i) => i !== undefined).join("/");
}

export const IDB_KEY = {
  /**
   * Last param should be '', to make it `/todo/` rather than `/todo`
   *
   * @example
   * await tx.scan(IDB_KEY.TODO({ userId: 'userId' })))
   * 'userId/todo/' --> list of todos
   *
   * await tx.set(IDB_KEY.TODO({ userId: 'userId', id: '1' })))
   * 'userId/todo/1' --> todo with id '1'
   */
  TODO: ({ userId, id = "" }: { userId: string; id?: string }) =>
    constructIDBKey([userId, "project", id]),
};
export type IDBKeys = keyof typeof IDB_KEY;

/**
 * Normalize data to readonly json value
 * to be stored onto index db
 *
 * @returns
 */
export function normalizeToReadonlyJSON(args: unknown) {
  return args as ReadonlyJSONValue;
}
