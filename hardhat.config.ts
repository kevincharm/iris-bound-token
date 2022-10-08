import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-dependency-compiler'

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.17',
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    networks: {
        hardhat: {
            forking: {
                enabled: true,
                url: process.env.MAINNET_URL as string,
                blockNumber: 15592200,
            },
            accounts: {
                count: 10,
            },
        },
        mainnet: {
            url: process.env.MAINNET_URL as string,
            chainId: 1,
            accounts: [process.env.MAINNET_PK as string],
        },
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
        gasPrice: 60,
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY as string,
        },
    },
    dependencyCompiler: {
        paths: [
            '@appliedzkp/semaphore-contracts/base/Verifier.sol',
            '@worldcoin/world-id-contracts/src/Semaphore.sol',
        ],
    },
}

export default config
