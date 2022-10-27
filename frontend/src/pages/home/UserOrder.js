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

function UserOrder(account, data, setData) {
  useEffect(() => {
    if (account !== "" && account !== undefined) getUserOrders();
  }, [account]);

  const getUserOrders = () => {
    axios
      .get(`${defaultAPI}get/userOrders?user=${account}`)
      .then((res) => {
        const temp = [];
        let index = 0;
        res.data.gold.buyOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Gold",
            "Buy",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        res.data.gold.sellOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Gold",
            "Sell",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        res.data.silver.buyOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Silver",
            "Buy",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        res.data.silver.sellOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Silver",
            "Sell",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        res.data.bronze.buyOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Bronze",
            "Buy",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        res.data.bronze.sellOrders.map((item) => {
          PushHelper(
            temp,
            index,
            "Bronze",
            "Sell",
            item.price,
            item.volume,
            item.token
          );
          index++;
        });
        setData(temp);
      })
      .catch((err) => message.error(err));
  };

  const deleteOrder = (type, tokenA, tokenB, price) => {
    axios
      .post(
        `${defaultAPI}remove/${type}?tokenA=${tokenA}&tokenB=${tokenB}&tokenBPrice=${price}&user=${account}`
      )
      .then(() => {
        message.success("Successfully deleted orders");
        getUserOrders();
      })
      .catch(() => {
        message.error("Unable to delete any records");
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
                  : record.type === "sell"
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
