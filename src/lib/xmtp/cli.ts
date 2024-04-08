import { Client } from '@xmtp/xmtp-js'
import { $, Glob } from 'bun'
import { getWalletClient } from '../eth/clients'

const glob = new Glob('cli-binary')

// This binary was downloaded from https://github.com/xmtp/libxmtp/releases/tag/cli-a8d3dd9
// You must download an appropriate binary for your system's architecture
let BINARY_PATH: string | undefined = undefined
for (const file of glob.scanSync({ absolute: true })) {
	if (file) BINARY_PATH = file
}

async function generateV2Client() {
	const { mnemonic, walletClient } = getWalletClient()
	// - ensure the wallet exists on the network
	await Client.create(
		// @ts-expect-error: xmtp types do not like private key accounts
		walletClient,
		{ env: 'dev' },
	)
	return mnemonic
}

export async function createClient(dbPath: string) {
	const runCommandTemplate = `${BINARY_PATH} --db ${dbPath} --json`

	let accountAddress: string | undefined = undefined

	try {
		accountAddress = (
			await extractDataFromOutput<{ account_address: string }>(`${runCommandTemplate} info`)
		)?.account_address
	} catch (e) {
		const seedPhrase = await generateV2Client()
		accountAddress = (
			await extractDataFromOutput<{ account_address: string }>(
				`${runCommandTemplate} register --seed-phrase "${seedPhrase}"`,
			)
		)?.account_address
	}

	return {
		accountAddress,
		async createGroup(permissions = 'group-creator-is-admin') {
			return (
				await extractDataFromOutput<{ group_id: string }>(
					`${runCommandTemplate} create-group ${permissions}`,
				)
			)?.group_id
		},
		async addMembers(groupId: string, accountAddresses: string[]) {
			return await extractDataFromOutput(
				`${runCommandTemplate} add-group-members ${groupId} --account-addresses ${accountAddresses.join(
					' ',
				)}`,
			)
		},
		async removeMembers(groupId: string, accountAddresses: string[]) {
			return await extractDataFromOutput(
				`${runCommandTemplate} remove-group-members ${groupId} --account-addresses ${accountAddresses.join(
					' ',
				)}`,
			)
		},
		async listGroups() {
			return (await extractDataFromOutput<{ groups: any[] }>(`${runCommandTemplate} list-groups`))
				?.groups
		},
		async send(groupId: string, message: string) {
			return await extractDataFromOutput(`${runCommandTemplate} send ${groupId} ${message}`)
		},
		async listMessages(groupId: string) {
			return (
				await extractDataFromOutput<{ messages: any[] }>(
					`${runCommandTemplate} list-group-messages ${groupId}`,
				)
			)?.messages
		},
	}
}

async function extractDataFromOutput<T extends Record<string, unknown>>(
	command: string,
): Promise<
	| ({
			level: number
			time: number
			msg: string
			command_output: boolean
	  } & T)
	| undefined
> {
	// @ts-expect-error
	for await (const line of $({ raw: [command] }).lines()) {
		try {
			const data = JSON.parse(line)
			if (data?.command_output) return data
		} catch (e) {}
	}
}

export class CliError {
	constructor(
		public exitCode: number,
		public stdout: Buffer,
		public stderr: Buffer,
	) {}
}
