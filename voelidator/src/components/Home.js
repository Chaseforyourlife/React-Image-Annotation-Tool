import React from 'react'; //ES6 js
import {Link} from 'react-router-dom';

function Home(){
    return(
        <div id='main'>
            <h1>VOELIDATOR</h1>
            <Link to='./regions/'><h2 className='actual-btn'>Start</h2></Link>
        </div>
    );
}

export default Home;