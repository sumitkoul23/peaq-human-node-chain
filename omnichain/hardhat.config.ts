import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'
import { EndpointId } from '@layerzerolabs/lz-definitions'
import './tasks/index'

const PRIVATE_KEY = process.env.PRIVATE_KEY
const accounts: HttpNetworkAccountsUserConfig | undefined = PRIVATE_KEY ? [PRIVATE_KEY] : undefined

if (accounts == null) {
    console.warn('PRIVATE_KEY is missing. Deployment transactions cannot be executed.')
}

const config: HardhatUserConfig = {
    paths: { cache: 'cache/hardhat' },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: { optimizer: { enabled: true, runs: 200 } },
            },
        ],
    },
    networks: {
        'bsc-mainnet': {
            eid: EndpointId.BSC_V2_MAINNET,
            url: process.env.RPC_URL_BSC || 'https://bsc.drpc.org',
            accounts,
        },
        'peaq-mainnet': {
            eid: EndpointId.PEAQ_V2_MAINNET,
            url: process.env.RPC_URL_PEAQ || 'https://quicknode1.peaq.xyz',
            accounts,
        },
        hardhat: { allowUnlimitedContractSize: true },
    },
    namedAccounts: { deployer: { default: 0 } },
}

export default config
