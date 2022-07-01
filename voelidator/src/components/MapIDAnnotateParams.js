import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom'
import Loading from './Loading.js'
import MapIDAnnotate from './MapIDAnnotate'
import Title from './Title.js'
import App from '../App.js'
import ScrollLock from 'react-scroll-lock-component';
import MapID from './MapID.js';


function MapIDAnnotateParams(){
    const {region_name,brand_name,map_id} = useParams();
    const getParams = async() => {
        setParams({
            "region_name":region_name,
            "brand_name":brand_name,
            "map_id":map_id
        });
    };
    useEffect( () => {
        getParams()
    }, []);
    const [params, setParams] = useState([{}]);
   
    //Get MAPIDANNOTATE with params    
    return(
        <MapIDAnnotate region_name={params.region_name} brand_name={params.brand_name} map_id={params.map_id} />
    )
}

/*

*/


export default MapIDAnnotateParams;