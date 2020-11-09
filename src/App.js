import React, { useReducer } from 'react';
import MainView from './view/main/MainView';
import LoginView from './view/login/LoginView'
import { HashRouter, Route } from 'react-router-dom'

const appState = {}
function appReducer(state, action) { }
export const AppContext = React.createContext(null)

export default () => {
  const reducer = useReducer(appReducer, appState)
  return (<AppContext.Provider value={reducer}>
    <HashRouter>
      <div style={{ width: '100%', height: '100%' }}>
        <Route path="/" exact component={LoginView} />
        <Route path="/mainView" component={MainView} />
      </div>
    </HashRouter>
  </AppContext.Provider>)
}