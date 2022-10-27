import React, { useState } from "react";
import { Select, message, InputNumber, Input } from "antd";
import axios from "axios";

import { defaultAPI, marketOption, option } from "./const";
import { PushHelper } from "./UserOrder";
import "../styles.css";

export const exchangeRate = ["1 GOLD", "1 SILVER", "100 BRONZE"];
export const exchangeRateValue = ["10 SILVER", "10 BRONZE", "1 GOLD"];

function TokenMarket({ account, setAccountInfo, setData }) {
  const [currency1, setCurrency1] = useState("GOLD");
  const [currency2, setCurrency2] = useState("");
  const [error, setError] = useState(false);
  const [tabulate, setTabulate] = useState(0);
  const [type, setType] = useState("buy");
  const [volume, setVolume] = useState(0);

  const checkBuyExchange = (C1, C2, V1, setV2, setE) => {
    if (
      (C1 === "GOLD" && C2 === "SILVER") ||
      (C1 === "SILVER" && C2 === "BRONZE")
    ) {
      setV2(V1 * 10);
      setE(false);
    }
    if (C1 === "GOLD" && C2 === "BRONZE") {
      setV2(V1 * 100);
      setE(false);
    }
    if (
      (C1 === "SILVER" && C2 === "GOLD") ||
      (C1 === "BRONZE" && C2 === "SILVER")
    ) {
      if (V1 >= 10 && V1 % 10 === 0) {
        setV2(V1 / 10);
        setE(false);
      } else setE(true);
    }
    if (C1 === "BRONZE" && C2 === "GOLD") {
      if (V1 >= 100 && V1 % 100 === 0) {
        setV2(V1 / 100);
        setE(false);
      } else setE(true);
    }
  };

  const buyTokenMarket = (tokenA, tokenB, amount, user) => {
    axios
      .post(
        `${defaultAPI}orders/buyTokenMarket?tokenA=${tokenA}&tokenB=${tokenB}&tokenBAmount=${amount}&user=${user}`
      )
      .then((res) => {
        if (res.data.result === "Failed") {
          message.error(res.data.message);
        } else {
          message.success(res.data.message);
        }
        getUserInfo(account);
        getUserOrders();
      })
      .catch(() => {
        message.error("Transaction was not successful");
      });
  };

  const sellTokenMarket = (tokenA, tokenB, amount, user) => {
    axios
      .post(
        `${defaultAPI}orders/sellTokenMarket?tokenA=${tokenA}&tokenB=${tokenB}&tokenBAmount=${amount}&user=${user}`
      )
      .then((res) => {
        if (res.data.result === "Failed") {
          message.error(res.data.message);
        } else {
          message.success(res.data.message);
        }
        getUserInfo(account);
        getUserOrders();
      })
      .catch(() => {
        message.error("Transaction was not successful");
      });
  };

  const getUserInfo = (value) => {
    axios
      .get(`${defaultAPI}get/userBalance?user=${value}`)
      .then((res) => {
        const temp = [
          res.data.address,
          parseInt(res.data.gold).toLocaleString(),
          parseInt(res.data.silver).toLocaleString(),
          parseInt(res.data.bronze).toLocaleString(),
        ];
        setAccountInfo(temp);
      })
      .catch((err) => message.error(err.response.data.message));
  };

  const getUserOrders = () => {
    axios
      .get(`${defaultAPI}get/userOrders?user=${account}`)
      .then((res) => {
        const temp = [];
        let index = 0;
        res.data.gold.buyOrders.map((item) => {
          PushHelper(temp, index, "Gold", "Buy", item.price, item.volume);
          index++;
        });
        res.data.gold.sellOrders.map((item) => {
          PushHelper(temp, index, "Gold", "Sell", item.price, item.volume);
          index++;
        });
        res.data.silver.buyOrders.map((item) => {
          PushHelper(temp, index, "Silver", "Buy", item.price, item.volume);
          index++;
        });
        res.data.silver.sellOrders.map((item) => {
          PushHelper(temp, index, "Silver", "Sell", item.price, item.volume);
          index++;
        });
        res.data.bronze.buyOrders.map((item) => {
          PushHelper(temp, index, "Bronze", "Buy", item.price, item.volume);
          index++;
        });
        res.data.bronze.sellOrders.map((item) => {
          PushHelper(temp, index, "Bronze", "Sell", item.price, item.volume);
          index++;
        });
        setData(temp);
      })
      .catch((err) => message.error(err));
  };

  return (
    <div className="home-swap-token-daddy" style={{ padding: "32px 0px" }}>
      <div
        className="home-swap-token"
        style={{ justifyContent: "flex-start", marginBottom: "32px" }}
      >
        <Select
          className="select swap"
          style={{ marginRight: "8px", width: "60px" }}
          defaultValue="Buy"
          options={marketOption}
          suffixIcon={false}
          onChange={(value) => setType(value)}
        />
        <h3>Token Market</h3>
      </div>
      <div className="home-swap-token" style={{ marginBottom: "16px" }}>
        <div>
          <Select
            className="select"
            options={option}
            value={currency1}
            status={error ? "error" : ""}
            onChange={(value) => {
              setCurrency1(value);
              if (value === currency2) {
                setError(true);
                message.error("Cannot exchange same currencies!");
              } else {
                setError(false);
                checkBuyExchange(
                  value,
                  currency2,
                  volume,
                  setTabulate,
                  setError
                );
              }
            }}
          />
          <InputNumber
            min={0}
            style={{ width: "150px" }}
            addonBefore={
              type === "buy" ? "Buying" : type === "sell" ? "Selling" : ""
            }
            value={volume}
            status={error ? "error" : ""}
            onChange={(value) => {
              setVolume(value);
              checkBuyExchange(
                currency1,
                currency2,
                value,
                setTabulate,
                setError
              );
            }}
          />
        </div>
        <img
          alt="swap-coins"
          src="./swap.png"
          style={{ height: "64px" }}
          onClick={() => {
            if (type === "buy") {
              buyTokenMarket(currency2, currency1, volume, account);
            }
            if (type === "sell") {
              sellTokenMarket(currency2, currency1, volume, account);
            }
          }}
        />
        <div>
          <Select
            className="select"
            options={option}
            status={error ? "error" : ""}
            value={currency2}
            onChange={(value) => {
              setCurrency2(value);
              if (value === currency1) {
                setError(true);
                message.error("Cannot exchange same currencies!");
              } else {
                setError(false);
                checkBuyExchange(
                  currency1,
                  value,
                  volume,
                  setTabulate,
                  setError
                );
              }
            }}
          />
          <Input disabled className="input" value={tabulate} />
        </div>
      </div>
    </div>
  );
}

export { TokenMarket };
