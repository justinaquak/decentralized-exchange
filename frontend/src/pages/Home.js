import React, { useState } from 'react'
import { Select, Input, Card } from 'antd';
import 'antd/dist/antd.min.css';

import NavBar from '../components/NavBar';
import CustomCard from '../components/Card';
import './styles.css';
import LabelAndField from '../components/LabelAndField';
import { AccountInfo } from './home/AccountInfo';
import { TokenMarket } from './home/TokenMarket';

const marketOption = [
  {value: 'buy', label: 'Buy'},
  {value: 'sell', label: 'Sell'},
]

const option = [
  {value: 'GOLD', label: 'GOLD'},
  {value: 'SILVER', label: 'SILVER'},
  {value: 'BRONZE', label: 'BRONZE'},
]

function Home() {
  const [accountInfo, setAccountInfo] = useState(['', '', '', ''])

  function SwapLimitTokens() {
    return (
      <div className='home-swap-token-daddy'>
        <div className="home-swap-token" style={{justifyContent: 'flex-start', marginBottom: '32px'}}>
          <Select 
            className='select swap' 
            style={{marginRight: '8px', width: '60px'}} 
            defaultValue="Buy" 
            options={marketOption} 
            suffixIcon={false}
          />
          <h2>Token Limit Market</h2>
        </div>
        <div className="home-swap-token" style={{justifyContent: 'flex-start', marginBottom: '32px'}}>
          <Card title="Exchange Rates" style={{width: '60%'}}>
            <LabelAndField label={[]} field={[]} />
          </Card>
        </div>
        <div className="home-swap-token" style={{marginBottom: '16px'}}>
          <div>
            <Select className='select' defaultValue="GOLD" options={option}/>
            <Input className='input' onChange={(e) => console.log(e.target.value)} addonBefore="$"/>
          </div>
          <img alt="swap-coins" src="./swap.png" style={{height: '64px'}}/>
          <div>
            <Select className='select' options={option}/>
            <Input className='input' onChange={(e) => console.log(e.target.value)} addonAfter="AMT"/>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <CustomCard content={AccountInfo(accountInfo, setAccountInfo)} />
        <CustomCard content={TokenMarket()} />
        <CustomCard content={SwapLimitTokens()} />
      </div>
    </div>
  );
}

export default Home;
