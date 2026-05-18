import assert from 'assert'
import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'PHNOFT'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    assert(deployer, 'Missing named deployer account')

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    const canonicalMint = network.name === 'peaq-mainnet'
    const founderWallet = process.env.FOUNDER_WALLET || deployer
    const ecosystemTreasury = process.env.ECOSYSTEM_TREASURY || deployer
    const nodeRewardVault = process.env.NODE_REWARD_VAULT || deployer
    const liquidityVault = process.env.LIQUIDITY_VAULT || deployer

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            endpointV2Deployment.address,
            deployer,
            canonicalMint,
            founderWallet,
            ecosystemTreasury,
            nodeRewardVault,
            liquidityVault,
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed ${contractName} on ${hre.network.name}: ${address}`)
    console.log(`canonicalMint=${canonicalMint}`)
}

deploy.tags = [contractName]
export default deploy
