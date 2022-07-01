import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom'
import Loading from './Loading.js'
import Title from './Title.js'
import App from '../App.js'
import ScrollLock from 'react-scroll-lock-component';

function MapID(){
    useEffect( () => {
        loading();
        fetchItems();
    }, []);
    const {region_name,brand_name,map_id} = useParams()
    const [initialData, setInitialData] = useState([{}]);
    const fetchItems = async() => {
        const data = await fetch(`/regions/${region_name}/${brand_name}/${map_id}`);
        const data_json = await data.json().then(
            setLoadState({"loading":false})
        ); 
        setInitialData(data_json);
    };
    const [LoadState, setLoadState] = useState([{}])
    const loading = async() => {
        setLoadState({"loading":true});
    };
    
    if(LoadState.loading === false){
        return(
            <div id='main'>
                <Title contents={`${map_id}`} />
                <Link to='./annotate/'>
                    <h2 className='actual-btn'>Annotate</h2>
                </Link>
                <Link to='./images/'>
                    <h2 className='actual-btn'>Review Annotated Images</h2>
                </Link>
                <Link to='./bid/'>
                    <h2 className='actual-btn'>TODO:BID Pulls</h2>
                </Link>
            </div>
        );
    }
    else if(LoadState.loading === true){
        return(
            <Loading />
        );
    }
}

/*

*/


export default MapID;