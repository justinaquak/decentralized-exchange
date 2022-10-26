import React from 'react'
import { Row, Col } from 'antd';

import LabelAndField from './LabelAndField';
import './styles.css'

const label = ['Max Bid Price', 'Max Bid Volume', 'Min Ask Price', 'Min Ask Volume']

function ExchangeRateLabelAndField({field}) {
  return (
    <Row>
      <Col span={8}>
        <h3>Gold:</h3>
        <LabelAndField 
          label={label} 
          field={[
            field.gold !== undefined ? field.gold.buyPrice: '', 
            field.gold !== undefined ? field.gold.buyVolume: '0', 
            field.gold !== undefined ? field.gold.sellPrice: '',
            field.gold !== undefined ? field.gold.sellVolume: '0',
          ]} />
      </Col>
      <Col span={8}>
        <h3>Silver:</h3>
        <LabelAndField 
          label={label} 
          field={[
            field.silver !== undefined ? field.silver.buyPrice: '',
            field.silver !== undefined ? field.silver.buyVolume: '0', 
            field.silver !== undefined ? field.silver.sellPrice: '',
            field.silver !== undefined ? field.silver.sellVolume: '0', 
          ]} />
      </Col>
      <Col span={8}>
        <h3>Bronze:</h3>
        <LabelAndField 
          label={label} 
          field={[
            field.bronze !== undefined ? field.bronze.buyPrice: '', 
            field.bronze !== undefined ? field.bronze.buyVolume: '0', 
            field.bronze !== undefined ? field.bronze.sellPrice: '',
            field.bronze !== undefined ? field.bronze.sellVolume: '0', 
          ]} />
      </Col>
    </Row>
  );
}

export default ExchangeRateLabelAndField;
