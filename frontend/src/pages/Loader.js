import React, { useEffect } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import { Navigate } from "react-router-dom";

import { defaultAPI } from "./home/const";
import loading from "../assets/loading.json";

function Loader({ init, setInit }) {
  useEffect(() => {
    InitContract();
  }, []);

  const InitContract = async () => {
    await axios.post(`${defaultAPI}create/contract`).then(() => {});
    await axios.post(`${defaultAPI}create/token`).then(() => {});
    setInit(true);
  };

  if (init) return <Navigate to="/home" />;

  return (
    <div className="animator-daddy">
      <Lottie style={{ width: "600px" }} animationData={loading} loop={true} />
    </div>
  );
}

export default Loader;
