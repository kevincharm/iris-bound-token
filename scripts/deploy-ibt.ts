import assert from 'assert'
import { BigNumberish } from 'ethers'
import { ethers, run } from 'hardhat'
import { IrisBoundToken__factory } from '../typechain-types'

// https://developer.worldcoin.org/api/v1/contracts
const WORLD_ID_INSTANCE = '0xD81dE4BCEf43840a2883e5730d014630eA6b7c4A'

async function main() {
    const { chainId } = await ethers.provider.getNetwork()
    assert(chainId === 137, 'ONLY MATIC!!!')

    const [deployer] = await ethers.getSigners()
    console.log(`Deployer: ${deployer.address}`)

    const ibtConstructorArgs: [string, BigNumberish] = [
        WORLD_ID_INSTANCE /** worldId instance */,
        1 /** groupId */,
    ]

    // Deploy IBT
    const ibt = await new IrisBoundToken__factory(deployer).deploy(...ibtConstructorArgs)
    const deployTx = ibt.deployTransaction
    console.log(deployTx)
    console.log(await deployTx.wait())
    await ibt.deployed()
    console.log(`IrisBoundToken deployed to: ${ibt.address}`)

    console.log('Waiting ~2min for Etherscan to confirm deployment...')
    await new Promise((resolve) => setTimeout(resolve, 60_000))

    await run('verify:verify', {
        address: ibt.address,
        constructorArguments: ibtConstructorArgs,
    })
    console.log('Verified on Etherscan!')
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
