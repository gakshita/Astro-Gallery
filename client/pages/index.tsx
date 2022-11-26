import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import useEagerConnect from '../hooks/useEagerConnect'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { multicallv2 } from '../helpers/multiContract'
import { getCallData } from '../config'
import { convertBigToNum, numberWithCommas, toWei } from '../helpers/numerics'
import useABBContract, { useStakingContract } from '../hooks/useContract'
import PulseLoader from 'react-spinners/PulseLoader'

interface IUserInfo {
  balance: string
  allowance: string
  redeemableAmount: string
  accuredAmount: string
}

const mint = () => {
  const [loadingState, setLoadingState] = useState(0)
  const [rewards, setRewards] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [stakingAmount, setStakingAmount] = useState<number | null>(null)
  const [solanaAddress, setSolanaAddress] = useState<string>('')
  const [userInfo, setUserInfo] = useState<IUserInfo | null>(null)

  const { account, connectWallet } = useEagerConnect()

  const performAction = async (action: string) => {
    const staking = useStakingContract()
    const ABB = useABBContract()
    let tx

    if (staking && ABB) {
      switch (action) {
        case 'stake':
          if (!solanaAddress || !stakingAmount || !duration) {
            return toast.error('Please provide all the details!')
          }
          if (!ethers.utils.isAddress(solanaAddress)) {
            return toast.error('Invalid solana address!')
          }
          let stakingAmountWei = toWei(stakingAmount)
          console.log('args', { stakingAmountWei, duration, solanaAddress })
          try {
            setLoadingState(1)
            if (
              userInfo?.allowance &&
              parseFloat(userInfo.allowance) < stakingAmount
            ) {
              tx = await ABB.approve(staking?.address, stakingAmountWei)
              await tx.wait()
            }
            tx = await staking.stake(stakingAmountWei, duration, solanaAddress)
            await tx.wait()
            setLoadingState(0)
            updateStats()
            return toast.success('Staked successfully!')
          } catch (error: any) {
            console.log(error, error.code)
            if (error.code && error.code == 4001) {
              toast.error('User denied transaction!')
            } else {
              toast.error('Something went wrong!')
            }
            setLoadingState(0)
            return
          }
        case 'redeem':
          setLoadingState(2)

          if (
            userInfo?.redeemableAmount &&
            parseFloat(userInfo?.redeemableAmount) > 0
          ) {
            tx = await staking.withdraw(account)
            await tx.wait()
            toast.success('Redeemed successfully!')
          } else {
            toast.info('Nothing to redeem!')
          }
          setLoadingState(0)
          updateStats()
          return
      }
    }
  }

  const updateStats = async () => {
    var result = await multicallv2(getCallData(account))
    let [balance, allowance, redeemableAmount, accuredAmount] =
      convertBigToNum(result)
    setUserInfo({
      balance,
      allowance,
      redeemableAmount,
      accuredAmount,
    })
  }

  const getReward = async () => {
    const staking = useStakingContract()
    if (stakingAmount && duration && staking) {
      const _rewards = await staking.calculateReward(
        toWei(stakingAmount),
        duration
      )
      setRewards(ethers.utils.formatEther(_rewards))
      return
    }
    setRewards(null)
  }

  useEffect(() => {
    setUserInfo(null)
    if (account) updateStats()
  }, [account])

  useEffect(() => {
    console.log({ userInfo })
  }, [userInfo])

  useEffect(() => {
    if (account) getReward()
  }, [stakingAmount, duration])

  return (
    <div className="">
      <div className="nav flex-sb shadow">
        <img src="https://astrogallery.io/fd0447e132932c75c366.png"></img>
        {!account ? (
          <a className="btn btn-3" href="#" onClick={connectWallet}>
            <span>Connect Wallet</span>
          </a>
        ) : (
          <div className="connected btn-4">
            <img src="/Wallet.png"></img>
            <span>{`${account.slice(0, 4)}..${account.slice(-4)}`}</span>
          </div>
        )}
      </div>
      <div className="container">
        {/* {account} */}
        <div className="head">Stake ABB</div>
        <div className="flex-sb pd cw-1 rd m-auto shadow">
          <div>
            <div className="txt-1 ">Available to stake</div>
            <div className="txt-2 ">
              {account && userInfo
                ? `${numberWithCommas(
                    parseFloat(userInfo.balance).toFixed(2)
                  )} ABB`
                : '-'}
            </div>
          </div>
          <div>
            <div className="txt-1 ">Accured Rewards</div>
            <div className="txt-2 ">
              {' '}
              {account && userInfo
                ? `${numberWithCommas(
                    parseFloat(userInfo.accuredAmount).toFixed(2)
                  )} ABB`
                : '-'}
            </div>
          </div>
        </div>
        <div className="pd cw-1 rd m-auto flex-col shadow">
          <div className="material-textfield flex-col">
            <label className="txt-1 ">Duration of staking</label>
            <div className="flex-sb">
              <a
                className={`btn-2 ${duration == 30 && 'btn-2-clicked'}`}
                onClick={() => setDuration(30)}
              >
                <span>30 days</span>
              </a>
              <a
                className={`btn-2 ${duration == 60 && 'btn-2-clicked'}`}
                onClick={() => setDuration(60)}
              >
                {' '}
                <span>60 days</span>
              </a>
              <a
                className={`btn-2 ${duration == 90 && 'btn-2-clicked'}`}
                onClick={() => setDuration(90)}
              >
                {' '}
                <span>90 days</span>
              </a>
            </div>
          </div>

          <div className="material-textfield flex-col">
            <label className="txt-1 ">Stake Amount</label>
            <input
              placeholder=""
              className="txt-2 "
              type="number"
              onChange={(e) => setStakingAmount(parseFloat(e.target.value))}
              value={stakingAmount || ''}
            />
          </div>
          <div className="material-textfield flex-col">
            <label className="txt-1 ">Solana address</label>
            <input
              placeholder=" "
              className="txt-2 "
              type="text"
              onChange={(e) => setSolanaAddress(e.target.value)}
              value={solanaAddress}
            />
          </div>
          {rewards ? (
            <label className="txt-1 txt-center">
              You will get{' '}
              <span className="highlight">
                {parseFloat(rewards.toString()).toFixed(2)} ABB
              </span>
            </label>
          ) : null}

          {account ? (
            <>
              <a
                className={`btn ${loadingState == 1 && 'loading'}`}
                href="#"
                onClick={() => performAction('stake')}
              >
                {loadingState == 1 ? (
                  <PulseLoader
                    color={'#fff'}
                    loading={true}
                    size={12}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  <span>Stake ABB</span>
                )}
              </a>
              <a
                className={`btn ${loadingState == 2 && 'loading'}`}
                href="#"
                onClick={() => performAction('redeem')}
              >
                {loadingState == 2 ? (
                  <PulseLoader
                    color={'#fff'}
                    loading={true}
                    size={12}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                ) : (
                  <span>
                    Redeem{' '}
                    {account && userInfo
                      ? `${numberWithCommas(
                          parseFloat(userInfo.redeemableAmount).toFixed(2)
                        )} ABB`
                      : '-'}{' '}
                  </span>
                )}
                <ToastContainer />
              </a>
            </>
          ) : (
            <a className="btn" href="#" onClick={connectWallet}>
              <span>Connect Wallet</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default mint
