
export {
  pesoFormatter,
  usdFormatter,
  yenFormatter,
  rupeeFormatter,
  euroFormatter,
  poundFormatter,
  CurrencyFormatter
}

const pesoFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'PHP',
})

const usdFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
})

const yenFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'JPY',
})

const rupeeFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'INR',
})

const poundFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'GBP',
})

const euroFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'EUR',
})

const CurrencyFormatter = (() => {
  switch (localStorage.getItem('CURRENCY_USED')) {
    case 'PHP': return pesoFormatter
    case 'USD': return usdFormatter
    case 'JPY': return yenFormatter
    case 'INR': return rupeeFormatter
    case 'GBP': return poundFormatter
    case 'EUR': return euroFormatter
  }

  return pesoFormatter
})()