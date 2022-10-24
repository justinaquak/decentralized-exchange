import React, { useEffect, useState } from 'react'
import { Select, Card, message, InputNumber } from 'antd';
import axios from 'axios';

import { marketOption, option, defaultAPI } from './const';
import '../styles.css'
import ExchangeRateLabelAndField from '../../components/ExchangeRateLabelAndField';

function TokenMarketLimit(account) {
  const [field, setField] = useState([]);
  const [type, setType] = useState('buy');

  const [currency1, setCurrency1] = useState('GOLD');
  const [currency2, setCurrency2] = useState('');
  const [price, setPrice] = useState(0);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    getMinAndMax()
  }, [])

  const getMinAndMax = () => {
    axios.get(`${defaultAPI}get/tokenPriceInfo`)
    .then(res => {
      setField(res.data)
    })
  }

  const buyTokenLimitMarket = (tokenA, tokenB, amount, user, value) => {
    axios.post(`${defaultAPI}orders/buyTokenLimit?tokenA=${tokenA}&tokenB=${tokenB}&tokenBAmount=${amount}&user=${user}&tokenBPrice=${value}`)
    .then(res => {
      if (res.data.result === 'Failed') {
        message.error(res.data.message)
        return
      }
      message.success(res.data.message)
      setTimeout(function(){ window.location.reload() }, 3000);
    })
    .catch(() => {
      message.error('Transaction was not successful')
    })
  }

  const sellTokenLimitMarket = (tokenA, tokenB, amount, user, value) => {
    axios.post(`${defaultAPI}orders/sellTokenLimit?tokenA=${tokenA}&tokenB=${tokenB}&tokenBAmount=${amount}&user=${user}&tokenBPrice=${value}`)
    .then(res => {
      if (res.data.result === 'Failed') {
        message.error(res.data.message)
        return
      }
      message.success(res.data.message)
      setTimeout(function(){ window.location.reload() }, 3000);
    })
    .catch(() => {
      message.error('Transaction was not successful')
    })
  }

  return (
    <div className='home-swap-token-daddy'>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Select
          className='select swap'
          style={{ marginRight: '8px', width: '80px' }}
          value={type}
          options={marketOption}
          onChange={(value) => setType(value)}
          suffixIcon={false}
        />
        <h2>Token Limit Order</h2>
      </div>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Card title="Orderbook" style={{ width: '100%' }}>
          <ExchangeRateLabelAndField field={field} />
        </Card>
      </div>
      <div className="home-swap-token" style={{ marginBottom: '16px' }}>
        <div>
          <Select className='select' value={currency1} options={option} onChange={(value) => setCurrency1(value)}/>
          <InputNumber value={price} onChange={(e) => setPrice(e.target.value)} style={{width: '120px'}} addonBefore="$" />
          <InputNumber value={volume} onChange={(e) => setVolume(e.target.value)} style={{width: '120px'}} addonAfter="AMT" />
        </div>
        <img 
          alt="swap-coins" 
          src="./swap.png" 
          style={{ height: '64px' }} 
          onClick={() => {
            if (type === 'buy') { buyTokenLimitMarket(currency2, currency1, volume, account, price) }
            if (type === 'sell') { sellTokenLimitMarket(currency2, currency1, volume, account, price) }
          }}
        />
        <div style={{width: '360px', display: 'flex', justifyContent: 'flex-end'}}>
          <Select className='select' value={currency2} options={option} onChange={(value) => setCurrency2(value)}/>
        </div>
      </div>
    </div>
  )
}

export {TokenMarketLimit};
