import React, { useState } from 'react'
import { Button, Select, Space, message } from 'antd';
import axios from 'axios';

import LabelAndField from '../../components/LabelAndField';
import '../styles.css'

const accountOption = [
  { value: 'owner', label: 'Account 1' },
  { value: 'actor', label: 'Account 2' },
  { value: 'third', label: 'Account 3' },
]

const accountLabel = ['Address:', 'Gold Balance:', 'Silver Balance:', 'Bronze Balance:']

function AccountInfo(accountInfo, setAccountInfo) {
  const [account, setAccount] = useState('')

  const getUserInfo = (value) => {
    axios.get(`http://localhost:5000/dex/get/userBalance?user=${value}`)
      .then(res => {
        const temp = [
          res.data.address,
          parseInt(res.data.gold).toLocaleString(),
          parseInt(res.data.silver).toLocaleString(),
          parseInt(res.data.bronze).toLocaleString()
        ]
        setAccountInfo(temp)
      });
  }

  const requestFaucet = (user) => {
    if (user !== 'owner') {
      axios.post(`http://localhost:5000/dex/transfer/faucet?user=${user}`)
        .then(() => {
          message.success('Request token is successful')
          window.location.reload()
        })
        .catch(err => message.error(err))
    } else {
      message.error('Owner account is the dispenser for faucet!')
    }
  }

  return (
    <div className="home-connect-meta-wallet-daddy">
      <div className="home-connect-meta-wallet">
        <h3 style={{ marginBottom: '0px', marginRight: '8px' }}>Account(s)</h3>
        <Select
          className='select'
          options={accountOption}
          onChange={(value) => {
            setAccount(value)
            getUserInfo(value)
          }
          }
        />
      </div>
      <Space direction="vertical" size={8} style={{ width: '60%', height: '120px', overflow: 'auto' }}>
        <LabelAndField label={accountLabel} field={accountInfo} />
      </Space>
      <div className="home-connect-meta-wallet">
        <h3 style={{ marginBottom: '0px', marginRight: '8px' }}>Request your tokens here:</h3>
        <Button type="primary" onClick={() => { requestFaucet(account) }}>Request</Button>
      </div>
    </div>
  );
}

export {AccountInfo};
