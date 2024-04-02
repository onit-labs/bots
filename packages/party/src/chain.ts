import type * as Party from "partykit/server";
import { safeUrls } from "./utils/validators";
import type { Chain, WalletClient } from "viem";
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { toCamelCase } from "./utils/camel-case";
import * as chains from 'viem/chains';

export default class ChainServer implements Party.Server {
  txServiceUrl: string;
  chain: Chain
  wallet: WalletClient

  constructor(readonly room: Party.Room) {
    const urls = safeUrls.parse(JSON.parse( (this.room.env.SAFE_TRANSACTION_SERVICE_URLS! as string)))
    this.txServiceUrl = urls[this.room.id]
    this.chain = chains[toCamelCase(this.room.id) as keyof typeof chains]
    const account = privateKeyToAccount(this.room.env.PRIVATE_KEY! as `0x${string}`) 
      this.wallet = createWalletClient({
        account,
        chain: mainnet,
        transport: http()
      })
  }

  async onStart() {
    if (this.room.id) {
      // save id when room starts from a connection or request
      await this.room.storage.put<string>("id", this.room.id);
      console.log('ChainServer started with id:', this.room.id, this.chain, this.txServiceUrl)
    }
  }

  async onRequest(req: Party.Request): Promise<Response> {
    console.log(`Hello from ${this.room.id} - ${this.txServiceUrl}`);
    return new Response(`Hello from ${this.room.id} - ${this.txServiceUrl}`);
  }

}

ChainServer satisfies Party.Worker;