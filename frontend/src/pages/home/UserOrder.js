import React, { useEffect, useState } from 'react'
import { Table, Card, message, Button } from 'antd';
import axios from 'axios';

import '../styles.css'
import { defaultAPI } from './const';

export const exchangeRate = ['1 GOLD', '1 SILVER', '100 BRONZE']
export const exchangeRateValue = ['10 SILVER', '10 BRONZE', '1 GOLD']

function UserOrder(account) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (account !== '' && account !== undefined) getUserOrders()
  }, [account])

  const getUserOrders = () => {
    axios.get(`${defaultAPI}get/userOrders?user=${account}`)
    .then(res => {
      const temp = []
      let index = 0
      res.data.gold.buyOrders.map(item => {
        temp.push({
          id: index,
          tokenName: 'Gold',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      res.data.gold.sellOrders.map(item => {
        temp.push({
          id: index,
          tokenName: 'Gold',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      res.data.silver.buyOrders.map(item => {
        if (item.price)
        temp.push({
          id: index,
          tokenName: 'Silver',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      res.data.silver.sellOrders.map(item => {
        temp.push({
          id: index,
          tokenName: 'Silver',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      res.data.bronze.buyOrders.map(item => {
        temp.push({
          id: index,
          tokenName: 'Bronze',
          type: 'Buy',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      res.data.bronze.sellOrders.map(item => {
        temp.push({
          id: index,
          tokenName: 'Bronze',
          type: 'Sell',
          price: item.price || 0,
          volume: item.volume || 0,
        })
        index++;
      })
      setData(temp)
    })
    .catch(err => message.error(err))
  }

  const columns = [
    {
      title: 'Token Name',
      dataIndex: 'tokenName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
    },
    {
      title: 'Actions',
      dataIndex: '',
      render: (_, record) => {
        return (
          <Button onClick={() => console.log(record)}>Delete</Button>
        )
      }
    },
  ];

  return (
    <div className='home-swap-token-daddy'>
      <Card title="User Order" bodyStyle={{padding: 0}} headStyle={{padding: '0px 16px'}}>
        <Table dataSource={data} columns={columns} rowKey="id"/>
      </Card>
    </div>
  );
}

export { UserOrder };
