import './App.css';
import axios from 'axios';
import React, {useEffect} from 'react'

function App() {

  const test = () => {
    axios.post('http://localhost:5000/fyp/contract')
      .then((res) => {
        console.log(res)
      })
  }

  const metaTransact = async (value) => {
    if (typeof window.ethereum !== 'undefined') {
      const account = await window.ethereum.request({ method: 'eth_requestAccounts' })
      // const transactionParameters = {
      //   from: account[0],
      //   to: '0xDd511D59eF4697f8912a9C39D604788975249a12',
      //   value: value,
      //   gasPrice: '0',
      //   gas: '0',
      // }
      // const txHash = await window.ethereum.request({
      //   method: 'eth_sendTransaction',
      //   params: [transactionParameters],
      // });
      // return txHash
    }
  }

  useEffect(() => {
    metaTransact()
  }, [])

  return (
    <div className="App">
      <button onClick={() => test()}>test</button>
    </div>
  );
}

export default App;
