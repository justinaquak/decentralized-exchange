import React, { useEffect, useState } from "react";
import "antd/dist/antd.min.css";
import { Navigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import CustomCard from "../components/Card";
import "./styles.css";
import { AccountInfo } from "./home/AccountInfo";
import { TokenMarketLimit } from "./home/TokenMarketLimit";
import { UserOrder } from "./home/UserOrder";

function Home({ init }) {
  const [accountInfo, setAccountInfo] = useState(["", "", "", ""]);
  const [account, setAccount] = useState("owner");
  const [data, setData] = useState([]);

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
