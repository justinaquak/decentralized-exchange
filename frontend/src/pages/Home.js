import React from 'react'
import Card from '../components/Card';

import NavBar from '../components/NavBar';
import './styles.css';

function Home() {

  function Test() {
    return (
      <div>hello</div>
    )
  }

  return (
    <div className="home-big-daddy">
      <NavBar />
      <div className="home-content-daddy">
        <Card content={Test()} />
        <Card content={Test()} />
        <Card content={Test()} />
        <Card content={Test()} />
      </div>
    </div>
  );
}

export default Home;
