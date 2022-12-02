import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CountdownTimer from '../TimeRecord'

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number
) {
  return { name, calories, fat, carbs }
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24),
  createData('Ice cream sandwich', 237, 9.0, 37),
  createData('Eclair', 262, 16.0, 24),
  createData('Cupcake', 305, 3.7, 67),
  createData('Gingerbread', 356, 16.0, 49),
]

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
  const getStatusType = (row) => {
    const currentDate = new Date()
    const timestamp = currentDate.getTime()
    const expiration = (row.depositTimestamp + row.lockUpPeriod * 86400) * 1000
    console.log({ expiration, row, timestamp })
    if (row.hasClaimed) return 'redeemed'
    else if (expiration < timestamp) return 'not-redeemed'
    else return 'timer'
  }
  const getStatus = (row, key) => {
    const currentDate = new Date()
    const timestamp = currentDate.getTime()
    const expiration = (row.depositTimestamp + row.lockUpPeriod * 86400) * 1000
    console.log({ expiration, row })
    if (row.hasClaimed) return 'Redeemed'
    else if (expiration < timestamp) return 'To be redeemed'
    else return <CountdownTimer targetDate={expiration} />
  }
  console.log({ data })
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Deposit Date</TableCell>
            <TableCell align="right">Amount Staked</TableCell>
            <TableCell align="right">Duration</TableCell>
            <TableCell align="right">Status</TableCell>
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
                  <TableCell align="right">{row.lockUpPeriod} days</TableCell>
                  <TableCell align="right">
                    <div className={getStatusType(row)}>
                      {getStatus(row, key)}
                    </div>
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
