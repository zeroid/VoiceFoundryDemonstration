import React from 'react';
import './App.css';
import CallsList from './CallsList';
import TryIt from './TryIt';

function App() {
    return (
        <div className="App">
            <header className="App-header"><h1>Voice Foundry Demonstration</h1></header>
            <main className="App-content">
                <div className="TryIt-container">
                    <h2>Try it</h2>
                    <TryIt />
                </div>
                <div className="CallsList-container">
                    <h2>Recent calls</h2>
                    <CallsList />
                </div>
            </main>
            <footer className="App-footer">Copyright 2022</footer>
        </div>
    );
}

export default App;
