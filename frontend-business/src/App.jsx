import './App.css'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Header from './components/Header';
import LoginPage from './pages/LoginPage'
import InitPage from './pages/InitPage';
import BuildPipelinePage from './pages/BuildPipelinePage'
import HomePage from './pages/HomePage';
import ProgressPage from './pages/ProgressPage';
import ResultPage from './pages/ResultPage';

function App() {

  return (
    <>
    <Router>
      <Header />
      <div className='content'>
        <Switch>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/upload">
            <InitPage />
          </Route>
          <Route path="/build">
            <BuildPipelinePage />
          </Route>
          <Route path="/progress">
            <ProgressPage />
          </Route>
          <Route path="/result">
            <ResultPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>

        </Switch>
      </div>

    </Router>
    </>


  )
}

export default App

