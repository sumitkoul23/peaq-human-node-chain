import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'
import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const bscContract: OmniPointHardhat = {
    eid: EndpointId.BSC_V2_MAINNET,
    contractName: 'PHNOFT',
}

const peaqContract: OmniPointHardhat = {
    eid: EndpointId.PEAQ_V2_MAINNET,
    contractName: 'PHNOFT',
}

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
]

const pathways: TwoWayConfig[] = [
    [
        bscContract,
        peaqContract,
        [['LayerZero Labs'], []],
        [20, 20],
        [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
    ],
]

export default async function () {
    const connections = await generateConnectionsConfig(pathways)
    return {
        contracts: [{ contract: bscContract }, { contract: peaqContract }],
        connections,
    }
}
