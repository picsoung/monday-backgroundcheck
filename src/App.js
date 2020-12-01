import React, { useState, useEffect } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";

import { Box, Grommet } from 'grommet';
import "monday-ui-style/dist/index.min.css";

import Home from "./components/views/Home.js";
// import TypeformPreview from "./components/views/Preview/TypeformPreview";
// import StartScreen from "./components/views/StartScreen/StartScreen.js";
// import SuccessScreen from "./components/views/SuccessScreen.js";
// import AppSettingsScreen from "./components/views/AppSettingsScreen.js";

const monday = mondaySdk();

const AppBar = (props) => (
  <Box
    direction='row'
    align='center'
    justify='between'
    background='brand'
    pad={{ left: 'medium', right: 'small', vertical: 'small' }}
    elevation='medium'
    style={{ zIndex: '1' }}
    {...props}
  />
);

function App () {
  const [displayedView, setView] = useState('home');
  const [typeform, setTypeform] = useState(null);
  const [boardId, setBoardId] = useState(null);
  const [mapping, setMapping] = useState([]);
  const [user, setUser] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  useEffect(() => {
    monday.listen("context", (res) => {
      monday
        .api(
          `query {
            me {
              id
              email
            }
          }`,
        )
        .then((res) => {
          setUser(res.data.me)
        });
    });
  }, []);

  // useEffect(() => {
  //   monday.api(`query { users { id, name } }`).then((res) => {
  //     const { users } = res.data;
  //     setUsersList(users);
  //   });
  // }, []);


  return (<React.Fragment>
    {/* <AppBar> */}
    { displayedView === 'home' && <Home 
      setView={setView}
      user={user}
      isTrackingEnabled={false}
    /> }
    {/* </AppBar> */}
  </React.Fragment>)
}

export default App;
