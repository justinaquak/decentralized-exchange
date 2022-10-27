import React, { useState } from "react";
import "antd/dist/antd.min.css";
import axios from "axios";

import NavBar from "../components/NavBar";
import CustomCard from "../components/Card";
import "./styles.css";
import { AccountInfo } from "./home/AccountInfo";
import { TokenMarketLimit } from "./home/TokenMarketLimit";
import { UserOrder } from "./home/UserOrder";
import { defaultAPI } from "./home/const";

function Home() {
  const [accountInfo, setAccountInfo] = useState(["", "", "", ""]);
  const [account, setAccount] = useState("owner");
  const [data, setData] = useState([]);

  const Init = () => {
    axios.post(`${defaultAPI}create/contract`).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <CustomCard
          content={AccountInfo(
            accountInfo,
            setAccountInfo,
            account,
            setAccount
          )}
        />
        <CustomCard content={UserOrder(account, data, setData)} />
        <CustomCard
          content={TokenMarketLimit(account, setAccountInfo, setData)}
        />
      </div>
    </div>
  );
}

export default Home;
