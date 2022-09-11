import './App.css';
import axios from 'axios';

function App() {

  const test = () => {
    axios.post('http://localhost:5000/fyp/contract')
      .then((res) => {
        console.log(res)
      })
  }

  return (
    <div className="App">
      <button onClick={() => test()}>test</button>
    </div>
  );
}

export default App;
