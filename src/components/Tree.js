import React, {Component} from 'react';

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>{JSON.stringify(this.props.tree, null, 2)}</div>
        );
    }
}

export default App;
