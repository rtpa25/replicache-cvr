import {
  type CVR,
  type DeleteMetadata,
  IDB_KEY,
  type IDBKeys,
  normalizeToReadonlyJSON,
  type PatchOperation,
  type TodoType,
} from "@repo/models";

//! Make sure key have the same name as IDB_KEY
type GenPatchArgs = {
  previousCVR?: CVR;
  TODO: {
    data: TodoType[];
    dels: DeleteMetadata[];
  };
};

export class ReplicacheService {
  static genPatch(args: GenPatchArgs): PatchOperation[] {
    const patch: PatchOperation[] = [];
    const { previousCVR, ...models } = args;

    if (previousCVR === undefined) {
      patch.push({ op: "clear" });
    }

    Object.entries(models).forEach(([_key, { data, dels }]) => {
      const key = _key as IDBKeys;

      dels.forEach((del) =>
        patch.push({
          op: "del",
          key: IDB_KEY[key]({ userId: del.userId, id: del.id }),
        }),
      );
      data.forEach((datum) =>
        patch.push({
          op: "put",
          key: IDB_KEY[key]({ userId: datum.userId, id: datum.id }),
          value: normalizeToReadonlyJSON(datum),
        }),
      );
    });

    return patch;
  }
}
