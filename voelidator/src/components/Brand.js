import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom'
import Loading from './Loading.js'
import Title from './Title.js'
import App from '../App.js'
import ScrollLock from 'react-scroll-lock-component';

function Brand(){
    useEffect( () => {
        loading();
        fetchItems();
    }, []);
    const {region_name,brand_name} = useParams()
    const [initialData, setInitialData] = useState([{}]);
    const fetchItems = async() => {
        const data = await fetch(`/regions/${region_name}/${brand_name}`);
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
                <Title contents={region_name +"-"+ brand_name} />
                {initialData.data?.map(map_id => (
                <Link to={`./${map_id.map_id}/`}>
                    <div className='card'>
                        <h2 className='no-margin'>Map ID: {map_id.map_id}</h2>
                        <h3 className="no-margin">Model: {map_id.model}</h3>
                        <h4 className='no-margin'>Annotated: {map_id.num_annotated}/{map_id.target_num}</h4>
                        <h4 className='no-margin'>Ready To Annotate In Database: {map_id.num_ready_to_annotate}</h4>
                    </div>
                </Link>))}
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


export default Brand;