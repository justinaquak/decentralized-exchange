import React, { useState } from 'react'
import { Select, Input, Tooltip, Button, Space, Card, InputNumber, message } from 'antd';
import 'antd/dist/antd.min.css';

import NavBar from '../components/NavBar';
import CustomCard from '../components/Card';
import './styles.css';
import LabelAndField from '../components/LabelAndField';

const marketOption = [
  {value: 'buy', label: 'Buy'},
  {value: 'sell', label: 'Sell'},
]

const option = [
  {value: 'GOLD', label: 'GOLD'},
  {value: 'SILVER', label: 'SILVER'},
  {value: 'BRONZE', label: 'BRONZE'},
]

const accountLabel = ['Address:', 'Gold Balance:', 'Silver Balance:', 'Bronze Balance:']
const accountInfo = ['0xF28F80606a22149fd3f123efd7A18c6fbA32bE45', '1,000,000', '1,000,000', '1,000,000']

const exchangeRate = ['1 GOLD', '1 SILVER', '100 BRONZE']
const exchangeRateValue = ['10 SILVER', '10 BRONZE', '1 GOLD']

function Home() {
  const [privateKeys, setPrivateKeys] = useState('');

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

  function ConnectToMetaWallet() {
    return (
      <div className="home-connect-meta-wallet-daddy">
        <h3>You can have a chemistry with us by connecting your accounts with us</h3>
        <div className="home-connect-meta-wallet">
          <span>Please enter your private key(s) here:</span>
          <Tooltip trigger={['hover']} title={"Seperate your private key(s) if any with , eg. 0xac0974bec3... , 0x59c6995e99..."} placement="bottomLeft">
            <Input 
              style={{marginLeft: '16px', width: '40%'}} 
              allowClear 
              onChange={(e) => setPrivateKeys(e.target.value)} 
              onPressEnter={(e) => console.log(e.target.value)}
            />
          </Tooltip>
          <Button onClick={() => console.log(privateKeys)}>Submit</Button>
        </div>
        <Space direction="vertical" size={8} style={{width: '60%', height: '120px', overflow: 'auto'}}>
          <LabelAndField label={accountLabel} field={accountInfo} />
        </Space>
      </div>
    )
  }

  function Faucet() {
    return (
      <div className="home-connect-meta-wallet-daddy">
        <h3>Request to get your own GOLD, SILVER and BRONZE tokens</h3>
        <div className="home-connect-meta-wallet">
          <span>Please enter your address here:</span>
          <Tooltip trigger={['hover']} title={"Seperate your private key(s) if any with , eg. 0xac0974bec3... , 0x59c6995e99..."} placement="bottomLeft">
            <Input 
              style={{marginLeft: '16px', width: '40%'}} 
              allowClear 
              onChange={(e) => setPrivateKeys(e.target.value)} 
              onPressEnter={(e) => console.log(e.target.value)}
            />
          </Tooltip>
          <Button onClick={() => console.log(privateKeys)}>Submit</Button>
        </div>
      </div>
    )
  }

  function SwapTokens() {
    const [currency1, setCurrency1] = useState('GOLD');
    const [currency2, setCurrency2] = useState('');
    const [error, setError] = useState(false);
    const [tabulate, setTabulate] = useState(0);
    const [volume, setVolume] = useState(0);

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
          <h2>Token Market</h2>
        </div>
        <div className="home-swap-token" style={{justifyContent: 'flex-start', marginBottom: '32px'}}>
          <Card title="Exchange Rates" style={{width: '60%'}}>
            <LabelAndField label={exchangeRate} field={exchangeRateValue} />
          </Card>
        </div>
        <div className="home-swap-token" style={{marginBottom: '16px'}}>
          <div>
            <Select 
              className='select' 
              options={option}
              value={currency1}
              status={error ? "error": ""}
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
              className='input' 
              value={volume}
              status={error ? "error": ""}
              onChange={(value) => {
                setVolume(value)
                checkBuyExchange(currency1, currency2, value, setTabulate, setError)
              }}
            />
          </div>
          <img alt="swap-coins" src="./swap.png" style={{height: '64px'}}/>
          <div>
            <Select 
              className='select' 
              options={option}
              status={error ? "error": ""}
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
          <span>Due to the exchange rates:</span>
          <span>1. Minimum of 10 Silver is required to buy/sell 1 Gold eg. 10 Silver to 1 Gold</span>
          <span>2. Silver must be in multiples of 10 to buy/sell Gold eg. 30 Silver to 3 Gold, 60 Silver to 6 Gold</span>
          <span>3. Minimum of 10 Bronze is required to buy/sell 1 Silver eg. 10 Bronze to 1 Silver</span>
          <span>4. Bronze must be in multiples of 10 to buy/sell Silver eg. 30 Bronze to 3 Silver, 60 Bronze to 6 Silver</span>
          <span>5. Minimum of 100 Bronze is required to buy/sell 1 Gold eg. 100 Bronze to 1 Gold</span>
          <span>6. Bronze must be in multiples of 100 to buy/sell Gold eg. 300 Bronze to 3 Gold, 600 Bronze to 6 Gold</span>
        </Space>
      </div>
    )
  }

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
            <Input className='input' onChange={(e) => console.log(e.target.value)} addonAfter="AMT"/>
          </div>
          <img alt="swap-coins" src="./swap.png" style={{height: '64px'}}/>
          <div style={{width: '420px', justifyContent: 'center', display: 'flex'}}>
            <Select className='select' options={option}/>
            {/* <Input className='input' addonBefore="$"/>
            <Input className='input' onChange={(e) => console.log(e.target.value)} addonAfter="AMT"/> */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <CustomCard content={ConnectToMetaWallet()} />
        <CustomCard content={Faucet()} />
        <CustomCard content={SwapTokens()} />
        <CustomCard content={SwapLimitTokens()} />
      </div>
    </div>
  );
}

export default Home;
