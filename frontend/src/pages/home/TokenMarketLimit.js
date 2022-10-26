import React, { useEffect, useState } from 'react'
import { Select, Card, message, InputNumber } from 'antd';
import axios from 'axios';

import { marketOption, option, defaultAPI } from './const';
import { PushHelper } from './UserOrder';
import '../styles.css'
import ExchangeRateLabelAndField from '../../components/ExchangeRateLabelAndField';
import { TokenMarket } from './TokenMarket';

function TokenMarketLimit(account, setAccountInfo, setData) {
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
        } else {
          message.success(res.data.message)
        }
        getUserInfo(account)
        getUserOrders()
      })
      .catch(err => {
        message.error(err.response.data.message)
      })
  }

  const sellTokenLimitMarket = (tokenA, tokenB, amount, user, value) => {
    axios.post(`${defaultAPI}orders/sellTokenLimit?tokenA=${tokenA}&tokenB=${tokenB}&tokenBAmount=${amount}&user=${user}&tokenBPrice=${value}`)
      .then(res => {
        if (res.data.result === 'Failed') {
          message.error(res.data.message)
        } else {
          message.success(res.data.message)
        }
        getUserInfo(account)
        getUserOrders()
      })
      .catch(err => {
        message.error(err.response.data.message)
      })
  }

  const getUserInfo = (value) => {
    axios.get(`${defaultAPI}get/userBalance?user=${value}`)
      .then(res => {
        const temp = [
          res.data.address,
          parseInt(res.data.gold).toLocaleString(),
          parseInt(res.data.silver).toLocaleString(),
          parseInt(res.data.bronze).toLocaleString()
        ]
        setAccountInfo(temp)
      })
      .catch(err => message.error(err.response.data.message))
  }

  const getUserOrders = () => {
    axios.get(`${defaultAPI}get/userOrders?user=${account}`)
      .then(res => {
        const temp = []
        let index = 0
        res.data.gold.buyOrders.map(item => {
          PushHelper(temp, index, 'Gold', 'Buy', item.price, item.volume)
          index++;
        })
        res.data.gold.sellOrders.map(item => {
          PushHelper(temp, index, 'Gold', 'Sell', item.price, item.volume)
          index++;
        })
        res.data.silver.buyOrders.map(item => {
          PushHelper(temp, index, 'Silver', 'Buy', item.price, item.volume)
          index++;
        })
        res.data.silver.sellOrders.map(item => {
          PushHelper(temp, index, 'Silver', 'Sell', item.price, item.volume)
          index++;
        })
        res.data.bronze.buyOrders.map(item => {
          PushHelper(temp, index, 'Bronze', 'Buy', item.price, item.volume)
          index++;
        })
        res.data.bronze.sellOrders.map(item => {
          PushHelper(temp, index, 'Bronze', 'Sell', item.price, item.volume)
          index++;
        })
        setData(temp)
      })
      .catch(err => message.error(err))
  }

  return (
    <div className='home-swap-token-daddy'>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px' }}>
        <Card title="Orderbook" style={{ width: '100%' }}>
          <ExchangeRateLabelAndField field={field} />
        </Card>
      </div>
      <div className="home-swap-token" style={{ justifyContent: 'flex-start', marginBottom: '32px'}}>
        <Select
          className='select swap'
          style={{ marginRight: '8px', width: '60px' }}
          value={type}
          options={marketOption}
          onChange={(value) => setType(value)}
          suffixIcon={false}
        />
        <h3>Token Limit</h3>
      </div>
      <div className="home-swap-token" style={{ marginBottom: '16px', borderBottom: '1px black solid', paddingBottom: '32px' }}>
        <div>
          <Select className='select' value={currency1} options={option} onChange={(value) => setCurrency1(value)} />
          <InputNumber min={0} value={price} onChange={(e) => setPrice(e)} style={{ width: '120px' }} addonBefore="$" />
          <InputNumber min={0} value={volume} onChange={(e) => setVolume(e)} style={{ width: '120px' }} addonAfter="AMT" />
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
        <div style={{ width: '360px', display: 'flex', justifyContent: 'flex-end' }}>
          <Select className='select' value={currency2} options={option} onChange={(value) => setCurrency2(value)} />
        </div>
      </div>
      <TokenMarket account={account} setAccountInfo={setAccountInfo} setData={setData} />
    </div>
  )
}

export { TokenMarketLimit };
