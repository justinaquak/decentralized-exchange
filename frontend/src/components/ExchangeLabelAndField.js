import { Row, Col } from 'antd';
import React from 'react'
import LabelAndField from './LabelAndField';
import './styles.css'

const goldLabel = ['1 Gold', '1 Gold']
const goldField = ['-> 10 Silver', '-> 100 Bronze']
const silverLabel = ['1 Silver', '10 Silver']
const silverField = ['-> 10 Bronze', '-> 1 Gold']
const bronzeLabel = ['10 Bronze', '100 Bronze']
const bronzeField = ['-> 1 Silver', '-> 1 Gold']

function ExchangeLabelAndField({label, field}) {
  return (
    <Row>
      <Col span={8}>
        <h3>Gold:</h3>
        <LabelAndField label={goldLabel} field={goldField} />
      </Col>
      <Col span={8}>
        <h3>Silver:</h3>
        <LabelAndField label={silverLabel} field={silverField} />
      </Col>
      <Col span={8}>
        <h3>Bronze:</h3>
        <LabelAndField label={bronzeLabel} field={bronzeField} />
      </Col>
    </Row>
  );
}

export default ExchangeLabelAndField;
