import React from 'react'
import { Select, Input } from 'antd';
import 'antd/dist/antd.min.css';

import NavBar from '../components/NavBar';
import Card from '../components/Card';
import './styles.css';

const option = [
  {value: 'IRON', label: 'IRON'},
  {value: 'GOLD', label: 'GOLD'},
  {value: 'SILVER', label: 'SILVER'},
  {value: 'BRONZE', label: 'BRONZE'},
]

function Home() {

  function ConnectToMetaWallet() {
    return (
      <div className="home-connect-meta-wallet">
        <span>You haven't connected to a wallet</span>
        <button style={{marginLeft: '16px'}}>Connect Wallet</button>
      </div>
    )
  }

  function SwapTokens() {
    return (
      <div className="home-swap-token">
        <div>
          <Select className='select' options={option}/>
          <Input className='input' />
        </div>
        <img alt="swap-coins" src="./swap.png" style={{height: '64px'}}/>
        <div>
          <Select className='select' options={option}/>
          <Input className='input' />
        </div>
      </div>
    )
  }

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <Card content={ConnectToMetaWallet()} />
        <Card content={SwapTokens()} />
      </div>
    </div>
  );
}

export default Home;
