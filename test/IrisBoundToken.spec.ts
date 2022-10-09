import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { IrisBoundToken, IrisBoundToken__factory } from '../typechain-types'
import { getProof, getRoot, prepareWorldID, registerIdentity, setUpWorldID } from './utils/worldId'

const EPNS_COMM_POLYGON = '0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa'
const EPNS_CHANNEL_ADDRESS = '0x97248C0ddC583537a824A7ad5Ee92D5f4525bcAa'

describe('IrisBoundToken', () => {
    let walletA: SignerWithAddress
    let walletB: SignerWithAddress
    let ibt: IrisBoundToken
    beforeEach(async () => {
        const signers = await ethers.getSigners()
        ;[walletA, walletB] = signers
        await prepareWorldID()
        const worldIdAddress = await setUpWorldID()
        ibt = await new IrisBoundToken__factory(walletA).deploy(
            'Iris-Bound Token',
            'IBT',
            worldIdAddress,
            1,
            EPNS_COMM_POLYGON,
            EPNS_CHANNEL_ADDRESS
        )
    })

    it('mints an IBT', async () => {
        const identity = await registerIdentity()
        const [nullifierHash, proof] = await getProof(identity, ibt.address, walletA.address)

        await ibt.connect(walletA).mint((await getRoot()).toString(), nullifierHash, proof)
        expect(await ibt.balanceOf(walletA.address)).to.equal(1)
    })

    it('reclaims an IBT', async () => {
        const identity = await registerIdentity()

        // Mint to walletA
        const [nullifierHash, proof] = await getProof(identity, ibt.address, walletA.address)
        await ibt.mint((await getRoot()).toString(), nullifierHash, proof)
        expect(await ibt.balanceOf(walletA.address)).to.equal(1)

        // Reclaim from walletB
        const [nullifierHashNext, proofNext] = await getProof(
            identity,
            ibt.address,
            walletB.address
        )
        expect(nullifierHash).to.equal(nullifierHashNext)
        await ibt
            .connect(walletB)
            .reclaim((await getRoot()).toString(), nullifierHashNext, proofNext)
        expect(await ibt.balanceOf(walletA.address)).to.equal(0)
        expect(await ibt.balanceOf(walletB.address)).to.equal(1)
    })

    it('does not allow an IBT to be minted if identity already minted', async () => {
        const identity = await registerIdentity()

        // Mint
        const [nullifierHash, proof] = await getProof(identity, ibt.address, walletA.address)
        await ibt.connect(walletA).mint((await getRoot()).toString(), nullifierHash, proof)
        expect(await ibt.balanceOf(walletA.address)).to.equal(1)

        // Try to mint again
        const [nullifierHashNext, proofNext] = await getProof(
            identity,
            ibt.address,
            walletA.address
        )
        await expect(
            ibt.connect(walletA).mint((await getRoot()).toString(), nullifierHashNext, proofNext)
        ).to.be.revertedWith('You already minted with your iris!')
        expect(await ibt.balanceOf(walletA.address)).to.equal(1)
    })

    it('does not allow an IBT to be reclaimed by an address that has previously owned an IBT', async () => {
        const identity = await registerIdentity()

        // Mint to walletA
        const [nullifierHash, proof] = await getProof(identity, ibt.address, walletA.address)
        await ibt.mint((await getRoot()).toString(), nullifierHash, proof)
        expect(await ibt.balanceOf(walletA.address)).to.equal(1)

        // Reclaim from walletB
        const [nullifierHashNext, proofNext] = await getProof(
            identity,
            ibt.address,
            walletB.address
        )
        expect(nullifierHash).to.equal(nullifierHashNext)
        await ibt
            .connect(walletB)
            .reclaim((await getRoot()).toString(), nullifierHashNext, proofNext)
        expect(await ibt.balanceOf(walletA.address)).to.equal(0)
        expect(await ibt.balanceOf(walletB.address)).to.equal(1)

        // Try to reclaim from walletA again
        const [nullifierHashLast, proofLast] = await getProof(
            identity,
            ibt.address,
            walletA.address
        )
        expect(nullifierHashNext).to.equal(nullifierHashLast)
        await expect(
            ibt.connect(walletA).reclaim((await getRoot()).toString(), nullifierHashLast, proofLast)
        ).to.be.revertedWith('This address has previously owned an IBT!')
        expect(await ibt.balanceOf(walletA.address)).to.equal(0)
        expect(await ibt.balanceOf(walletB.address)).to.equal(1)
    })
})
