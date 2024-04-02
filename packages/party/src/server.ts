import type * as Party from "partykit/server";
import type { Address, EIP1193RequestFn, TransportConfig, WalletClient } from 'viem';
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import type { Chain } from 'viem/chains';
import * as chains from 'viem/chains';
import { toCamelCase } from "./utils/camel-case";
import type { SafeSingletonResponse } from '@safe-global/api-kit';
import { safeUrls } from "./utils/validators";
import type { ApiClient, NetworkOptions, Client as XmtpClient } from '@xmtp/xmtp-js'

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
  wallet: WalletClient
  xmtp?: XmtpClient

  constructor(readonly room: Party.Room) {
    void this.setupChains()
    const account = privateKeyToAccount(this.room.env.PRIVATE_KEY! as `0x${string}`) 
    this.wallet = createWalletClient({
      account,
      chain: mainnet,
      transport: http()
    })

    void this.setupXmtpClient()

    // - set an alarm to query the chains for the latest safe
    // this.room.storage.setAlarm(Date.now() + this.interval) 
  }

  async onRequest(req: Party.Request): Promise<Response> {
    const requestUrl =new URL(req.url)

    console.log(`Hello from ${this.room.id} ${requestUrl} - ${this.urls[this.room.id]}`)
    switch (requestUrl.pathname) {
      case '/safes/:address': {
        switch (req.method) {
          case 'GET':
            const address = requestUrl.searchParams.get('address') as Address
            return new Response(JSON.stringify(this.getSafe(address)), { status: 200 })
        }
      }
      default:
        return new Response(null,{ status: 404, statusText: 'Not Found' });
    }
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
      const chainName = toCamelCase(kebabCaseChainName)

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

  // - we only have to do the following things with XMTP
  // 1. query the groups of the current user
  // 2. create new groups with the current user
  // 3. Add/remove users to/from the groups
  async setupXmtpClient() {
    const { GrpcApiClient } = await import("./utils/xmtp")
    const { Client, StaticKeystoreProvider, KeyGeneratorKeystoreProvider } = await import("@xmtp/xmtp-js/node")

    // tODO: store keys
    // Get the keys using a valid Signer. Save them somewhere secure.
    // const keys = await Client.getKeys(this.wallet, {
    //   env: 'dev',
    //   apiUrl: 'https://grpc.dev.xmtp.network:443',
      
    //   // apiClientFactory: GrpcApiClient.fromOptions,
    //   // keystoreProviders: [new KeyGeneratorKeystoreProvider()]
    // }).catch(e => console.error('error getting keys', e))
    

    const keys = new Uint8Array(JSON.parse(this.room.env.XMTP_KEY_BUNDLE! as string))
    // Create a client using keys returned from getKeys
    const xmtp = await Client.create(null, { 
      env: 'dev',
      privateKeyOverride: keys,
      // apiUrl: 'https://grpc.dev.xmtp.network:443',
      apiClientFactory: GrpcApiClient.fromOptions,
      keystoreProviders: [new StaticKeystoreProvider()],
     }).catch(e => console.error('error creating client', e))

     console.log('keys', xmtp)
     if (xmtp) this.xmtp = xmtp

  }
}

OnitServer satisfies Party.Worker;
