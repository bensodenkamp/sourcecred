// @flow
import React, { Component } from 'react';
import data from './data.json';
import './App.css';
import { FileExplorer } from './FileExplorer.js';
import { UserExplorer } from './UserExplorer.js';

type AppState = {selectedPath: string, selectedUser: ?string};
class App extends Component<{}, AppState> {
  constructor() {
    super();
    this.state = {
      selectedPath: "",
      selectedUser: null,
    };
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">SourceCred Explorer</h1>
        </header>
        <FileExplorer
          className="file-explorer"
          onSelectPath={(x) => this.setState({selectedPath: x})}
          selectedPath={this.state.selectedPath}
          data={data}
        />
        <UserExplorer
          className="user-explorer"
          selectedPath={this.state.selectedPath}
          selectedUser={this.state.selectedUser}
          onSelectUser={(x) => this.setState({selectedUser: x})}
          data={data}
        />
      </div>
    );
  }
}

export default App;
