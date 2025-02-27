export const formatDuration = (ms) => {
    if (!ms || ms < 0) return '0h00m00s'
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours}h${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`
}
  
export const getDuration = (entry) => {
if (!entry?.start) return 0
const start = new Date(entry.start)
const end = entry.end === null ? new Date() : new Date(entry.end)
return end - start
}