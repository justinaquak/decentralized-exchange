import React, { useState } from 'react'
import { Card, Select, Space, message, InputNumber, Input } from 'antd';
import axios from 'axios';

import ExchangeLabelAndField from '../../components/ExchangeLabelAndField';
import { marketOption, option } from './const';
import '../styles.css'

export const exchangeRate = ['1 GOLD', '1 SILVER', '100 BRONZE']
export const exchangeRateValue = ['10 SILVER', '10 BRONZE', '1 GOLD']

function TokenMarket(account) {
  const [currency1, setCurrency1] = useState('GOLD');
  const [currency2, setCurrency2] = useState('');
  const [error, setError] = useState(false);
  const [tabulate, setTabulate] = useState(0);
  const [type, setType] = useState('buy')
  const [volume, setVolume] = useState(0);

  const checkBuyExchange = (C1, C2, V1, setV2, setE) => {
    if ((C1 === 'GOLD' && C2 === 'SILVER') || (C1 === 'SILVER' && C2 === 'BRONZE')) {
      setV2(V1 * 10)
      setE(false)
    }
    if (C1 === 'GOLD' && C2 === 'BRONZE') {
      setV2(V1 * 100)
      setE(false)
    }
    if ((C1 === 'SILVER' && C2 === 'GOLD') || (C1 === 'BRONZE' && C2 === 'SILVER')) {
      if (V1 >= 10 && V1 % 10 === 0) {setV2(V1 / 10); setE(false)}
      else setE(true)
    }
    if (C1 === 'BRONZE' && C2 === 'GOLD') {
      if (V1 >= 100 && V1 % 100 === 0) {setV2(V1 / 100); setE(false)}
      else setE(true)
    }
  }

  const buyTokenMarket = () => {}

  const sellTokenMarket = () => {}

  return (
    <div className='home-swap-token-daddy'>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Select
          className='select swap'
          style={{ marginRight: '8px', width: '60px' }}
          defaultValue="Buy"
          options={marketOption}
          suffixIcon={false}
          onChange={(value) => setType(value)}
        />
        <h2>Token Market</h2>
      </div>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Card title="Exchange Rates" style={{ width: '100%' }}>
          <ExchangeLabelAndField label={exchangeRate} field={exchangeRateValue} />
        </Card>
      </div>
      <div className="home-swap-token" style={{ marginBottom: '16px' }}>
        <div>
          <Select
            className='select'
            options={option}
            value={currency1}
            status={error ? "error" : ""}
            onChange={(value) => {
              setCurrency1(value)
              if (value === currency2) {
                setError(true)
                message.error("Cannot exchange same currencies!")
              } else {
                setError(false)
                checkBuyExchange(value, currency2, volume, setTabulate, setError)
              }
            }}
          />
          <InputNumber
            addonBefore={
              type === 'buy' ? "Buying": 
              type === 'sell' ? "Selling": ""
            }
            className='input'
            value={volume}
            status={error ? "error" : ""}
            onChange={(value) => {
              setVolume(value)
              checkBuyExchange(currency1, currency2, value, setTabulate, setError)
            }}
          />
        </div>
        <img 
          alt="swap-coins" 
          src="./swap.png" 
          style={{ height: '64px' }} 
          onClick={() => {
            if (type === 'buy') console.log('here')
            if (type === 'sell') console.log('here')
          }}
        />
        <div>
          <Select
            className='select'
            options={option}
            status={error ? "error" : ""}
            value={currency2}
            onChange={(value) => {
              setCurrency2(value)
              if (value === currency1) {
                setError(true)
                message.error("Cannot exchange same currencies!")
              } else {
                setError(false)
                checkBuyExchange(currency1, value, volume, setTabulate, setError)
              }
            }}
          />
          <Input disabled className='input' value={tabulate} />
        </div>
      </div>
      <Space direction="vertical" size={4}>
        <h3>Due to the exchange rates:</h3>
        <span>1. Minimum of 10 Silver is required to buy/sell 1 Gold eg. 10 Silver to 1 Gold</span>
        <span>2. Silver must be in multiples of 10 to buy/sell Gold eg. 30 Silver to 3 Gold, 60 Silver to 6 Gold</span>
        <span>3. Minimum of 10 Bronze is required to buy/sell 1 Silver eg. 10 Bronze to 1 Silver</span>
        <span>4. Bronze must be in multiples of 10 to buy/sell Silver eg. 30 Bronze to 3 Silver, 60 Bronze to 6 Silver</span>
        <span>5. Minimum of 100 Bronze is required to buy/sell 1 Gold eg. 100 Bronze to 1 Gold</span>
        <span>6. Bronze must be in multiples of 100 to buy/sell Gold eg. 300 Bronze to 3 Gold, 600 Bronze to 6 Gold</span>
      </Space>
    </div>
  );
}

export { TokenMarket };
