import React, { useEffect, useState } from 'react'
import { Table, Card, message, Button } from 'antd';
import axios from 'axios';

import '../styles.css'

export const exchangeRate = ['1 GOLD', '1 SILVER', '100 BRONZE']
export const exchangeRateValue = ['10 SILVER', '10 BRONZE', '1 GOLD']

function UserOrder(account) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (account !== '' && account !== undefined) getUserOrders()
  }, [account])

  const getUserOrders = () => {
    axios.get(`http://localhost:5000/dex/get/userOrders?user=${account}`)
    .then(res => {
      const temp = []
      res.data.gold.buyOrders.map(item => {
        temp.push({
          tokenName: 'Gold',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      res.data.gold.sellOrders.map(item => {
        temp.push({
          tokenName: 'Gold',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      res.data.silver.buyOrders.map(item => {
        if (item.price)
        temp.push({
          tokenName: 'Silver',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      res.data.silver.sellOrders.map(item => {
        temp.push({
          tokenName: 'Silver',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      res.data.bronze.buyOrders.map(item => {
        temp.push({
          tokenName: 'Bronze',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      res.data.bronze.sellOrders.map(item => {
        temp.push({
          tokenName: 'Bronze',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
      })
      setData(temp)
    })
    .catch(err => message.error(err))
  }

  const columns = [
    {
      title: 'Token Name',
      dataIndex: 'tokenName',
      key: 'tokenName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
    },
    {
      title: 'Actions',
      dataIndex: '',
      key: 'action',
      render: () => {
        return (
          <Button>Delete</Button>
        )
      }
    },
  ];

  return (
    <div className='home-swap-token-daddy'>
      <Card title="User Order" bodyStyle={{padding: 0}} headStyle={{padding: '0px 16px'}}>
        <Table dataSource={data} columns={columns} />
      </Card>
    </div>
  );
}

export { UserOrder };
