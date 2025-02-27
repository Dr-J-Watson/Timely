export const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('fr-FR')
}

export const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
}