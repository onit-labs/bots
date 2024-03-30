import type * as Party from "partykit/server";
import type { Address, WalletClient } from 'viem';
import type { Chain } from 'viem/chains';
import * as chains from 'viem/chains';
import { toCamelCase } from "./utils/camel-case";
import type { SafeSingletonResponse } from '@safe-global/api-kit';
import { safeUrls } from "./utils/validators";

interface ChainWithSafe extends Chain {
  safe: {
    singletons: SafeSingletonResponse[]
    txServiceUrl: string
  }
}


export default class OnitServer implements Party.Server {
  interval = 1000 * Number(this.room.env.ALARM_INTERVAL_IN_SECONDS!)
  urls: Record<string, string> = safeUrls.parse(JSON.parse( (this.room.env.SAFE_TRANSACTION_SERVICE_URLS! as string)))
  chains: ChainWithSafe[] = []
  wallet?: WalletClient

  constructor(readonly room: Party.Room) {
    void this.setupChains()
    this.room.storage.setAlarm(Date.now() + this.interval) 
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // let's send a message to the connection
    conn.send("hello from server");
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    // as well as broadcast it to all the other connections in the room...
    this.room.broadcast(
      `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id]
    );
  }

  onAlarm(): void | Promise<void> {
    // Query each chain for the latest safe 
    for (const chainName of Object.keys(this.urls)) {
      const safePartyUrl = `http://127.0.0.1:1999/parties/chain/${chainName}`
      fetch(safePartyUrl)
    }

    this.room.storage.setAlarm(Date.now() + this.interval) 
  }

  async setupChains() {
    for await (const [kebabCaseChainName,txServiceUrl] of Object.entries(this.urls))  {
      const chainName=  toCamelCase(kebabCaseChainName)

      if (chainName in chains)  {
        const chain = chains[chainName as keyof typeof chains]
        try {
        const singletons = await fetch(`${txServiceUrl}/api/v1/about/singletons/`).then(res => res.json()) as SafeSingletonResponse[] | undefined
        this.chains.push({...chain, safe: { txServiceUrl, singletons: singletons || []}})
        } catch (e) {
          console.error('error', e)
        }
      }
    }
  }

  async getSafe(address: Address) {
    // TODO: handle passing an eip3770 address?
    for await (const chain of this.chains) {
      const safeInfo = await fetch(`${chain.safe.txServiceUrl}/api/v1/safes/${address}`).then(res => res.json())
      console.log(`safe chain -> ${chain.name}`, safeInfo)
    }
  }

}

OnitServer satisfies Party.Worker;
