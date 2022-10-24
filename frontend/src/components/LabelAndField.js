import { Row, Col, Space } from 'antd';
import React from 'react'
import './styles.css'

function LabelAndField({label, field}) {
  return (
    <Row>
      <Col span={12}>
        <Space direction='vertical' size={8}>
          {label.map((item, index) => {
            return <span key={index}>{item}</span>
          })}
        </Space>
      </Col>
      <Col span={12}>
        <Space direction='vertical' size={8}>
          {field.map((item, index) => {
            return <span key={index}>{item}</span>
          })}
        </Space>
      </Col>
    </Row>
  );
}

export default LabelAndField;
