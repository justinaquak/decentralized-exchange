import { Select, Card, Input } from 'antd';
import React from 'react'

import LabelAndField from '../../components/LabelAndField';
import { marketOption, option } from './const';
import '../styles.css'

function TokenMarketLimit() {
  return (
    <div className='home-swap-token-daddy'>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Select
          className='select swap'
          style={{ marginRight: '8px', width: '60px' }}
          defaultValue="Buy"
          options={marketOption}
          suffixIcon={false}
        />
        <h2>Token Limit Market</h2>
      </div>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Card title="Exchange Rates" style={{ width: '60%' }}>
          <LabelAndField label={[]} field={[]} />
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
