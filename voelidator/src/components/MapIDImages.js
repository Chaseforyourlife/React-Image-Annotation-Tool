import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom'
import Loading from './Loading.js'
import Title from './Title.js'
import App from '../App.js'
import ScrollLock from 'react-scroll-lock-component';

function MapIDImages(){
    useEffect( () => {
        loading();
        fetchItems();
    }, []);
    const {region_name,brand_name,map_id} = useParams()
    const [initialData, setInitialData] = useState([{}]);
    const fetchItems = async() => {
        const data = await fetch(`/regions/${region_name}/${brand_name}/${map_id}/images`);
        const data_json = await data.json().then(
            setLoadState({"loading":false})
        ); 
        setInitialData(data_json);
    };
    const [LoadState, setLoadState] = useState([{}])
    const loading = async() => {
        setLoadState({"loading":true});
    };

    const undoAnnotation = async(image) => {
        
        const response = await fetch(`./undo`,{
            'method':'POST',
            headers : {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({'worksite':image.worksite,'capture_time':image.capture_time})
        })
        const done_response = await response.json().then(
            image.undone = 1
        ).then(
            setLoadState({"loading":false})
        )
    } 
    
    if(LoadState.loading === false){
        return(
            <div className='white-back'>
                <Title subheading='Images May Take Time To Display' contents={`${map_id} Images`}/>
                {initialData.data?.map(image =>
                    <>
                    
                    {image.position==0?image.undone==1?<><br></br><h2 className='btn-undo pointer'>Annotation Removed</h2></>:
                    <><br></br><h2 onClick={() => undoAnnotation(image)} className='btn-undo pointer'>Undo Annotation {image.index}</h2></>:null}
                    <img className='image-check' src={`data:image/png;base64,${image.image}`}></img>
                    </>)}
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


export default MapIDImages;