export type SearchResult = {
  id: string;
  rowVersion: number;
  userId: string;
};

export type DeleteMetadata = {
  id: string;
  userId: string;
};

export type ClientViewMetadata = { rowVersion: number; userId: string };
type ClientViewMap = Map<string, ClientViewMetadata>;

/**
 * A Client View Record (CVR) is a minimal representation of a Client View snapshot.
 * In other words, it captures what data a Client Group had at a particular moment in time.
 */
export class CVR {
  public clientVersion: number;
  public todos: ClientViewMap;

  constructor({ clientVersion, todos }: { clientVersion: number; todos: ClientViewMap }) {
    this.clientVersion = clientVersion;
    this.todos = todos;
  }

  static serializeSearchResult(result: SearchResult[]): Map<string, ClientViewMetadata> {
    const data = new Map<string, ClientViewMetadata>();
    result.forEach((row) => data.set(row.id, { rowVersion: row.rowVersion, userId: row.userId }));

    return data;
  }

  static getPutsSince(nextData: ClientViewMap, prevData: ClientViewMap): string[] {
    const puts: string[] = [];
    nextData.forEach((meta, id) => {
      const prev = prevData.get(id);
      if (prev === undefined || prev.rowVersion < meta.rowVersion) {
        puts.push(id);
      }
    });
    return puts;
  }

  static getDelsSince(nextData: ClientViewMap, prevData: ClientViewMap): DeleteMetadata[] {
    const dels: DeleteMetadata[] = [];
    prevData.forEach((val, id) => {
      if (!nextData.has(id)) {
        dels.push({ userId: val.userId, id });
      }
    });
    return dels;
  }

  static generateCVR({
    clientVersion,
    todosMeta,
  }: {
    clientVersion: number;
    todosMeta: SearchResult[];
  }): CVR {
    return {
      todos: CVR.serializeSearchResult(todosMeta),
      clientVersion,
    };
  }
}
