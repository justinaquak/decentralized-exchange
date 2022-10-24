import React, { useState } from 'react'
import 'antd/dist/antd.min.css';

import NavBar from '../components/NavBar';
import CustomCard from '../components/Card';
import './styles.css';
import { AccountInfo } from './home/AccountInfo';
import { TokenMarket } from './home/TokenMarket';
import { TokenMarketLimit } from './home/TokenMarketLimit';
import { UserOrder } from './home/UserOrder';

function Home() {
  const [accountInfo, setAccountInfo] = useState(['', '', '', ''])
  const [account, setAccount] = useState('');

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <CustomCard content={AccountInfo(accountInfo, setAccountInfo, account, setAccount)} />
        <CustomCard content={TokenMarket(account, accountInfo)} />
        <CustomCard content={TokenMarketLimit(account, accountInfo)} />
        <CustomCard content={UserOrder(account)} />
      </div>
    </div>
  );
}

export default Home;
