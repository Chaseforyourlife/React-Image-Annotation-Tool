import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom';
import Title from './Title';


function Regions(){
    
    useEffect( () => {
        fetchItems();
    }, []);
    const [initialData, setInitialData] = useState([{}]);
    const fetchItems = async() => {
        const data = await fetch('/regions');
        const data_json = await data.json(); 
        setInitialData(data_json);

    };

    return(
        <div id='main'>
            <Title contents='Select a Region'/>
            {initialData.data?.map(region => (<Link to={`./${region.name}/`}><h2 className='actual-btn'>{region.name}</h2></Link>))}
        </div>
    );
}

export default Regions;