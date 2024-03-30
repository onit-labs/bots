import type * as Party from "partykit/server";
import { safeUrls } from "./utils/validators";

export default class ChainServer implements Party.Server {
  txServiceUrl: string;

  constructor(readonly room: Party.Room) {
    const urls = safeUrls.parse(JSON.parse( (this.room.env.SAFE_TRANSACTION_SERVICE_URLS! as string)))
    this.txServiceUrl = urls[this.room.id]
  }

  async onStart() {
    if (this.room.id) {
      // save id when room starts from a connection or request
      await this.room.storage.put<string>("id", this.room.id);
    }
  }

  async onRequest(req: Party.Request): Promise<Response> {
    console.log(`Hello from ${this.room.id} - ${this.txServiceUrl}`);
    return new Response(`Hello from ${this.room.id} - ${this.txServiceUrl}`);
  }

}

ChainServer satisfies Party.Worker;