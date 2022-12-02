import React from 'react'
import { useCountdown } from '../hooks/useCountdown'

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <div className={isDanger ? 'countdown danger' : 'countdown'}>
      <span className="bold magenta">
        {value}
        {type}{' '}
      </span>
    </div>
  )
}

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
      <span>Expired!!!</span>
      <p>Please select a future date and time.</p>
    </div>
  )
}

const ShowCounter = ({ days, hours, minutes, seconds }) => {
  return (
    <div className="show-counter">
      <a
        href="https://tapasadhikary.com"
        target="_blank"
        rel="noopener noreferrer"
        className="countdown-link flex-end"
      >
        {days ? (
          <DateTimeDisplay value={days} type={'d'} isDanger={days <= 3} />
        ) : null}
        &nbsp;
        {days || hours ? (
          <DateTimeDisplay value={hours} type={'h'} isDanger={false} />
        ) : null}
        &nbsp;
        {!days ? (
          <DateTimeDisplay value={minutes} type={'m'} isDanger={false} />
        ) : null}
        &nbsp;
        {!days && !hours ? (
          <DateTimeDisplay value={seconds} type={'s'} isDanger={false} />
        ) : null}
        &nbsp;to redeem
      </a>
    </div>
  )
}

const CountdownTimer = ({ targetDate }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate)

  if (days + hours + minutes + seconds <= 0) {
    return <ExpiredNotice />
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    )
  }
}

export default CountdownTimer
