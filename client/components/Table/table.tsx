import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CountdownTimer from '../TimeRecord'

import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

const ONE_DAY = 86400

export default function BasicTable({ data }) {
  const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000
  const NOW_IN_MS = new Date().getTime()

  const dateTimeAfterThreeDays = NOW_IN_MS + THREE_DAYS_IN_MS

  const getTime = (timestamp: number) => {
    let d = new Date(timestamp * 1000)
    let date = d.toDateString().split(' ')
    let time = d.toLocaleTimeString().split(':')
    console.log(d.toLocaleTimeString(), time)
    return date[1] + ' ' + date[2] + ', ' + time[0] + ':' + time[1]
  }
  const getStatusType = (row: any) => {
    const currentDate = new Date()
    const timestamp = currentDate.getTime()
    const expiration =
      (row.depositTimestamp + row.lockUpPeriod * ONE_DAY) * 1000
    if (row.hasClaimed) return 'redeemed'
    else if (expiration < timestamp) return 'not-redeemed'
    else return 'timer'
  }
  const getStatus = (row: any) => {
    const currentDate = new Date()
    const timestamp = currentDate.getTime()
    const expiration =
      (row.depositTimestamp + row.lockUpPeriod * ONE_DAY) * 1000
    if (row.hasClaimed) return 'Redeemed'
    else if (expiration < timestamp) return 'To be redeemed'
    else return <CountdownTimer targetDate={expiration} />
  }

  const calculateUserRewardPerStaking = (
    depositTimestamp: number,
    lockupDays: number,
    amount: any
  ) => {
    var currentTime = new Date().getTime() / 1e3
    var currentDayCount = Math.floor((currentTime - depositTimestamp) / ONE_DAY)
    console.log({
      amount,
      depositTimestamp,
      lockupDays,
      currentTime,
      currentDayCount,
    })
    currentDayCount =
      currentDayCount > lockupDays ? lockupDays : currentDayCount
    var lockupDaysToAPY: any = {
      30: 500,
      60: 1000,
      90: 1500,
    }
    let reward =
      (lockupDaysToAPY[lockupDays] * parseFloat(amount) * currentDayCount) /
      (365 * 1e4)
    return reward
  }
  console.log({ data })
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Deposit Date</TableCell>
            <TableCell align="right">Amount Staked</TableCell>
            <TableCell align="right">Accrued Reward</TableCell>
            <TableCell align="right">Staking Duration</TableCell>
            <TableCell align="right">Redemption Status </TableCell>
          </TableRow>
        </TableHead>
        {data.length > 0 ? (
          <TableBody>
            {data &&
              data.map((row: any, key: number) => (
                <TableRow
                  key={key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {getTime(row.depositTimestamp)}
                  </TableCell>
                  <TableCell align="right">{row.amount} ABB</TableCell>
                  <TableCell align="right">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip className="tooltip shadow">
                          {calculateUserRewardPerStaking(
                            row.depositTimestamp,
                            row.lockUpPeriod,
                            row.amount
                          ).toFixed(8)}{' '}
                          ABB
                        </Tooltip>
                      }
                    >
                      <span className="u">
                        {calculateUserRewardPerStaking(
                          row.depositTimestamp,
                          row.lockUpPeriod,
                          row.amount
                        ).toFixed(2)}{' '}
                        ABB
                      </span>
                    </OverlayTrigger>
                  </TableCell>
                  <TableCell align="right">{row.lockUpPeriod} days</TableCell>
                  <TableCell align="right">
                    <div className={getStatusType(row)}>{getStatus(row)}</div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        ) : (
          <div className="placeholder-1">Nothing staked yet!</div>
        )}
      </Table>
    </TableContainer>
  )
}
