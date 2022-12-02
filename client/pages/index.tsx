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
import validateSolAddress from '../helpers/validateSolana'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

interface IUserInfo {
  balance: string
  allowance: string
  redeemableAmount: string
  accruedAmount: string
  claimedAmount: string
  stakedAmount: string
}

const mint = () => {
  const [loadingState, setLoadingState] = useState(0)
  const [rewards, setRewards] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [stakingAmount, setStakingAmount] = useState<number | null>(null)
  const [solanaAddress, setSolanaAddress] = useState<string>()
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
          if (!validateSolAddress(solanaAddress)) {
            return toast.error('Invalid solana address!')
          }
          let stakingAmountWei = toWei(stakingAmount)
          if (
            userInfo?.balance &&
            parseFloat(userInfo?.balance) < stakingAmount
          ) {
            return toast.error("You don't have enough tokens!")
          }
          try {
            setLoadingState(1)
            if (
              userInfo?.allowance &&
              parseFloat(userInfo.allowance) < stakingAmount
            ) {
              tx = await ABB.approve(staking?.address, stakingAmountWei)
              await tx.wait()
              toast.success('Approved successfully!')
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
            tx = await staking.withdraw()
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
    let [balance, allowance, redeemableAmount, accruedAmount] =
      convertBigToNum(result)

    const axios = require('axios')
    const { utils, BigNumber } = require('ethers')
    let claimedAmount
    let stakedAmount
    let response = await axios.post(
      'https://api.thegraph.com/subgraphs/name/ummehanizaki10/staking-abb',
      {
        query:
          'query UserStakingData($account: Bytes!) {\n  currentUserPositions(where: {id: $account}) {\n    claimedAmount\n    stakedAmount\n    id\n  }\n}',
        variables: {
          account: account,
        },
        operationName: 'UserStakingData',
        extensions: {
          headers: null,
        },
      },
      {
        headers: null,
      }
    )
    response = response.data.data.currentUserPositions[0]
      ? response.data.data.currentUserPositions[0]
      : { claimedAmount: '0', stakedAmount: '0' }
    claimedAmount = utils.formatEther(response.claimedAmount)
    claimedAmount = (+claimedAmount).toFixed(3)
    stakedAmount = utils.formatEther(response.stakedAmount)
    stakedAmount = (+stakedAmount).toFixed(3)

    setUserInfo({
      balance,
      allowance,
      redeemableAmount,
      accruedAmount,
      claimedAmount,
      stakedAmount,
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

  function calc(num: number) {
    if (num) return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    else return num
  }
  return (
    <div className="">
      <ToastContainer />

      <div className="nav flex-sb shadow">
        <img src="https://astrogallery.io/fd0447e132932c75c366.png"></img>
        <div className="flex">
          <a className="txt-center github flex" href="" target="_blank">
            Github
          </a>
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
      </div>
      {/* {!userInfo && account ? (
        <div className="h-100 container">
          <div className="loading">
            <div></div>
            <div></div>
          </div>
        </div>
      ) : ( */}
      <div className="container">
        {/* {account} */}
        <div className="head">
          <img src="/coin.png"></img>
          <span>Stake ABB</span>
        </div>
        <div className="flex-sb pd cw-1 rd m-auto shadow">
          <div>
            <div className="txt-1 ">Available to stake</div>
            <div className="txt-2 ">
              {account && userInfo
                ? `${calc(parseFloat(userInfo.balance))} ABB`
                : '-'}
            </div>
          </div>
          <div>
            <div className="txt-1 ">Accrued Rewards</div>
            <div className="txt-2 ">
              {account && userInfo ? (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip className="tooltip shadow">
                      {parseFloat(userInfo && userInfo.accruedAmount).toFixed(
                        8
                      )}{' '}
                      ABB
                    </Tooltip>
                  }
                >
                  <span className="u">
                    {numberWithCommas(
                      parseFloat(userInfo.accruedAmount).toFixed(3)
                    )}{' '}
                    ABB
                  </span>
                </OverlayTrigger>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
        <div className="flex-sb pd cw-1 rd m-auto shadow">
          <div>
            <div className="txt-1 ">Current Staked</div>
            <div className="txt-2 ">
              {account && userInfo
                ? `${calc(parseFloat(userInfo.stakedAmount))} ABB`
                : '-'}
            </div>
          </div>
          <div>
            <div className="txt-1 ">Total Redeemed</div>
            <div className="txt-2 ">
              {account && userInfo
                ? `${calc(parseFloat(userInfo.claimedAmount))} ABB`
                : '-'}
            </div>
          </div>
        </div>
        <div className="pd cw-1 rd m-auto flex-col shadow">
          <div className="material-textfield flex-col">
            <label className="txt-1 ">Duration of Staking </label>
            <div className="flex-sb">
              <a
                className={`btn-2 ${duration == 30 && 'btn-2-clicked'}`}
                onClick={() => setDuration(30)}
              >
                <span>30 days</span>
                <span className="apy">5% APY</span>
              </a>
              <a
                className={`btn-2 ${duration == 60 && 'btn-2-clicked'}`}
                onClick={() => setDuration(60)}
              >
                {' '}
                <span>60 days</span>
                <span className="apy">10% APY</span>
              </a>
              <a
                className={`btn-2 ${duration == 90 && 'btn-2-clicked'}`}
                onClick={() => setDuration(90)}
              >
                {' '}
                <span>90 days</span>
                <span className="apy">15% APY</span>
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
            <label className="txt-1 ">Solana Address</label>
            <input
              placeholder=" "
              className="txt-2 "
              type="text"
              onChange={(e) => setSolanaAddress(e.target.value)}
              value={solanaAddress}
            />
          </div>
          {rewards ? (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip className="tooltip shadow">
                  {parseFloat(rewards.toString()).toFixed(8)} ABB
                </Tooltip>
              }
            >
              <label className="txt-1 txt-center">
                You will get{' '}
                <span className="highlight u">
                  {parseFloat(rewards.toString()).toFixed(3)} ABB
                </span>
              </label>
            </OverlayTrigger>
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
                  <span>Approve & Stake ABB</span>
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
                      : ''}{' '}
                  </span>
                )}
              </a>
            </>
          ) : (
            <a className="btn" href="#" onClick={connectWallet}>
              <span>Connect Wallet</span>
            </a>
          )}
        </div>
      </div>
      {/* )} */}
    </div>
  )
}

export default mint
