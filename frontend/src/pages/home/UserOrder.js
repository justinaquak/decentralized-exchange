import React, { useEffect } from "react";
import { Table, Card, message, Button } from "antd";
import axios from "axios";

import "../styles.css";
import { defaultAPI } from "./const";

export const exchangeRate = ["1 GOLD", "1 SILVER", "100 BRONZE"];
export const exchangeRateValue = ["10 SILVER", "10 BRONZE", "1 GOLD"];

export const PushHelper = (temp, id, tokenName, type, price, volume, token) => {
  temp.push({
    id: id,
    tokenName: tokenName,
    type: type,
    price: price || 0,
    volume: volume || 0,
    token: token || "",
  });
};

function UserOrder(account, setAccountInfo, data, setData, setField) {
  useEffect(() => {
    if (account !== "" && account !== undefined) getUserOrders();
  }, [account]);

  const getUserInfo = (value) => {
    axios
      .get(`${defaultAPI}get/userBalance?user=${value}`)
      .then((res) => {
        const temp = [
          res.data.address,
          res.data.gold === "" ? 0 : parseInt(res.data.gold).toLocaleString(),
          res.data.silver === ""
            ? 0
            : parseInt(res.data.silver).toLocaleString(),
          res.data.bronze === ""
            ? 0
            : parseInt(res.data.bronze).toLocaleString(),
        ];
        setAccountInfo(temp);
      })
      .catch(() => message.error("Unable to get user account details"));
  };

  const getUserOrders = () => {
    axios
      .get(`${defaultAPI}get/userOrders?user=${account}`)
      .then((res) => {
        const temp = [];
        let index = 0;
        res.data.gold.buyOrders.map((item) => {
          PushHelper(temp, index, "Gold", "Buy", item.price, item.volume, item.token);
          index++;
        });
        res.data.gold.sellOrders.map((item) => {
          PushHelper(temp, index, "Gold", "Sell", item.price, item.volume, item.token);
          index++;
        });
        res.data.silver.buyOrders.map((item) => {
          PushHelper(temp, index, "Silver", "Buy", item.price, item.volume, item.token);
          index++;
        });
        res.data.silver.sellOrders.map((item) => {
          PushHelper(temp, index, "Silver", "Sell", item.price, item.volume, item.token);
          index++;
        });
        res.data.bronze.buyOrders.map((item) => {
          PushHelper(temp, index, "Bronze", "Buy", item.price, item.volume, item.token);
          index++;
        });
        res.data.bronze.sellOrders.map((item) => {
          PushHelper(temp, index, "Bronze", "Sell", item.price, item.volume, item.token);
          index++;
        });
        setData(temp);
      })
      .catch(() => message.error("Unable to get user orders!"));
  };

  const getMinAndMax = () => {
    axios.get(`${defaultAPI}get/tokenPriceInfo`).then((res) => {
      setField(res.data);
    });
  };

  const deleteOrder = (type, tokenA, tokenB, price) => {
    axios
      .post(
        `${defaultAPI}remove/${type}?tokenA=${tokenA}&tokenB=${tokenB}&tokenBPrice=${price}&user=${account}`
      )
      .then(() => {
        message.success("Successfully deleted orders");
        getUserInfo(account);
        getUserOrders();
        getMinAndMax();
      })
      .catch(() => {
        message.error("Unable to delete order");
      });
  };

  const columns = [
    {
      title: "Token Name",
      dataIndex: "tokenName",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Volume",
      dataIndex: "volume",
    },
    {
      title: "Actions",
      dataIndex: "",
      render: (_, record) => {
        return (
          <Button
            onClick={() => {
              deleteOrder(
                record.type.toLowerCase() === "buy"
                  ? "buyOrder"
                  : record.type.toLowerCase() === "sell"
                  ? "sellOrder"
                  : "",
                record.token,
                record.tokenName.toUpperCase(),
                record.price
              );
            }}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <div className="home-swap-token-daddy">
      <Card
        title="User Order"
        bodyStyle={{ padding: 0 }}
        headStyle={{ padding: "0px 16px" }}
      >
        <Table dataSource={data} columns={columns} rowKey="id" />
      </Card>
    </div>
  );
}

export { UserOrder };
