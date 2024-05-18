export type SearchResult = {
  id: string;
  rowVersion: number;
};

export type ClientViewMetadata = { rowVersion: number };
type ClientViewMap = Map<string, ClientViewMetadata>;

/**
 * A Client View Record (CVR) is a minimal representation of a Client View snapshot.
 * In other words, it captures what data a Client Group had at a particular moment in time.
 */
export class CVR {
  public clients: ClientViewMap;
  public todos: ClientViewMap;

  constructor({ clients, todos }: { clients: ClientViewMap; todos: ClientViewMap }) {
    this.clients = clients;
    this.todos = todos;
  }

  static serializeSearchResult(result: SearchResult[]): Map<string, ClientViewMetadata> {
    const data = new Map<string, ClientViewMetadata>();
    result.forEach((row) => data.set(row.id, { rowVersion: row.rowVersion }));

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

  static getDelsSince(nextData: ClientViewMap, prevData: ClientViewMap): string[] {
    const dels: string[] = [];
    prevData.forEach((_, id) => {
      if (!nextData.has(id)) {
        dels.push(id);
      }
    });
    return dels;
  }

  static generateCVR({
    todosMeta,
    clientsMeta,
  }: {
    todosMeta: SearchResult[];
    clientsMeta: SearchResult[];
  }): CVR {
    return {
      todos: CVR.serializeSearchResult(todosMeta),
      clients: CVR.serializeSearchResult(clientsMeta),
    };
  }
}
