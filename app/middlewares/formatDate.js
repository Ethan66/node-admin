module.exports = async (ctx, next) => {
  ctx.formatDate = (now = null, fmt = 'YYYY-MM-DD hh:mm:ss') => {
    if (typeof now === 'string') {
      now = now.replace(/-/g, '/')
    }
    now = now === null ? new Date() : new Date(now)
    const o = {
      'M+': now.getMonth() + 1, // 月份
      'D+': now.getDate(), // 日
      'h+': now.getHours(), // 小时
      'm+': now.getMinutes(), // 分
      's+': now.getSeconds(), // 秒
      'q+': Math.floor((now.getMonth() + 3) / 3), // 季度
      'ms+': now.getMilliseconds() // 毫秒
    }
    if (/(Y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (now.getFullYear() + ''))
    }
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, String(o[k]).padStart(RegExp.$1.length, 0))
      }
    }
    return fmt
  }
  await next()
}
