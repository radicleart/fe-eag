import { Duration, DateTime } from 'luxon'

const lsatHelper = {
  getConfig (data) {
    return ''
  },
  lsatExpired (invoice) {
    if (!invoice || !invoice.lightning_invoice) {
      return false
    }
    const expiry = invoice.lightning_invoice.expires_at * 1000 // + 3600000
    const now = new Date().getTime()
    const expired = expiry < now
    return expired
  },
  lsatExpires (invoice) {
    if (!invoice || !invoice.lightning_invoice) {
      return new Date().getTime()
    }
    const expires = invoice.lightning_invoice.expires_at * 1000 // + 3600000
    return DateTime.fromMillis(expires).format('YYYY-MM-DD HH:mm')
  },
  lsatDuration (invoice) {
    if (!invoice || !invoice.lightning_invoice) {
      return {
        hours: 0, // duration.asHours(),
        minutes: 59,
        seconds: 59
      }
    }
    const duration = Duration.fromMillis(invoice.lightning_invoice.expires_at * 1000)
    const timeout = {
      hours: 0, // duration.asHours(),
      minutes: duration.minutes,
      seconds: duration.seconds
    }
    return timeout
  }
}
export default lsatHelper
