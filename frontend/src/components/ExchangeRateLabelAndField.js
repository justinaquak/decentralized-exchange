import React from 'react'
import { Row, Col } from 'antd';

import LabelAndField from './LabelAndField';
import './styles.css'

function ExchangeRateLabelAndField({field}) {
  return (
    <Row>
      <Col span={8}>
        <h3>Gold:</h3>
        <LabelAndField label={['Buy Price', 'Sell Price']} field={[field.gold !== undefined ? field.gold.buyPrice: '', field.gold !== undefined ? field.gold.sellPrice: '']} />
      </Col>
      <Col span={8}>
        <h3>Silver:</h3>
        <LabelAndField label={['Buy Price', 'Sell Price']} field={[field.silver !== undefined ? field.silver.buyPrice: '', field.silver !== undefined ? field.silver.sellPrice: '']} />
      </Col>
      <Col span={8}>
        <h3>Bronze:</h3>
        <LabelAndField label={['Buy Price', 'Sell Price']} field={[field.bronze !== undefined ? field.bronze.buyPrice: '', field.bronze !== undefined ? field.bronze.buyPrice: '']} />
      </Col>
    </Row>
  );
}

export default ExchangeRateLabelAndField;
