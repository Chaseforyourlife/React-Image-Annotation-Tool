import {Link} from 'react-router-dom';
import React, {createContext, useEffect, useState} from 'react'; //ES6 js

class Loading extends React.Component{
    constructor(props){
        super(props);
        this.initialDots = 1;
        this.maxDots = 3;
        this.dotChar = "."
        this.state = {
            secondsElapsed:0,
            dots:this.initialDots
        };
    }
    componentDidMount(){
        this.interval = setInterval(() => this.tick(), 250);
    }
    componentWillUnmount(){
        clearInterval(this.interval);
    }
    tick(){
        setTimeout(() => this.changeLoadState(), 0);
        this.setState((prevState) => ({
            secondsElapsed: prevState.secondsElapsed + 1,
        }));
    }
    changeLoadState(prevState){
        this.setState((prevState) => ({
            secondsElapsed:prevState.secondsElapsed+1,
            dots:prevState.dots>=this.maxDots?this.initialDots:prevState.dots+1
        }));
    }
    render(){
        return(
            <h1>Loading{this.dotChar.repeat(this.state.dots)}</h1>
        );
    }
    
}

export default Loading;