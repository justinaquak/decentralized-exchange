import React, { useEffect, useState } from 'react'
import { Select, Card, Input } from 'antd';
import axios from 'axios';

import { marketOption, option, defaultAPI } from './const';
import '../styles.css'
import ExchangeRateLabelAndField from '../../components/ExchangeRateLabelAndField';

function TokenMarketLimit() {
  const [field, setField] = useState([]);
  const [type, setType] = useState('buy')

  useEffect(() => {
    getMinAndMax()
  }, [])

  const getMinAndMax = () => {
    axios.get(`${defaultAPI}get/tokenPriceInfo`)
    .then(res => {
      setField(res.data)
    })
  }

  return (
    <div className='home-swap-token-daddy'>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Select
          className='select swap'
          style={{ marginRight: '8px', width: '60px' }}
          value={type}
          options={marketOption}
          onChange={(value) => setType(value)}
          suffixIcon={false}
        />
        <h2>Token Limit Market</h2>
      </div>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Card title="Exchange Rates" style={{ width: '100%' }}>
          <ExchangeRateLabelAndField field={field} />
        </Card>
      </div>
      <div className="home-swap-token" style={{ marginBottom: '16px' }}>
        <div>
          <Select className='select' defaultValue="GOLD" options={option} />
          <Input className='input' onChange={(e) => console.log(e.target.value)} addonBefore="$" />
        </div>
        <img alt="swap-coins" src="./swap.png" style={{ height: '64px' }} />
        <div>
          <Select className='select' options={option} />
          <Input className='input' onChange={(e) => console.log(e.target.value)} addonAfter="AMT" />
        </div>
      </div>
    </div>
  )
}

export {TokenMarketLimit};
