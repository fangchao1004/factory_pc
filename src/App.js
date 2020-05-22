import React from 'react';
import MainView from './view/main/MainView';
import LoginView from './view/login/LoginView'
import { HashRouter, Route } from 'react-router-dom'
function App() {
  return (
    <HashRouter>
      <div style={{ width: '100%', height: '100%' }}>
        <Route path="/" exact component={LoginView} />
        <Route path="/mainView" component={MainView} />
      </div>
    </HashRouter>
  );
}

export default App;
