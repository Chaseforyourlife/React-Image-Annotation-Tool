import React, {useEffect, useState} from 'react'; //ES6 js
import {Link, useParams} from 'react-router-dom'
import Loading from './Loading';
import Title from './Title'

function Region(){
    
    console.log("BEGINNING")
    const {region_name} = useParams()
    
    const [initialData, setInitialData] = useState([{}]);
    const [checked, setChecked] = useState();
    const [everChecked, setEverChecked] = useState();
    const [LoadState, setLoadState] = useState([{}]);
    useEffect(() => {
        loading();
        fetchItems();
        return;
    }, []);
    useEffect(() => {
        console.log('Use Effect 2')
        if(everChecked) { fetchStats(); }

    }, [everChecked]);
    
    
    const loading = async() => {
        setLoadState({"loading":true});
    };
    // const addChecker = async() => {
    //     console.log("ADDCHECKER")
    //     document.getElementById('stats-check').addEventListener('change',(e) => handleClick(e))
    //     //document.getElementById('stats-check').removeEventListener('change',(e) => handleClick(e))
    //     console.log("WORKING")
    //     console.log(checked.checked)
    // }
    const fetchItems = async() => {
        const data = await fetch(`/regions/${region_name}`);
        const data_json = await data.json().then(
            data_json => setInitialData(data_json)
        ).then(
            setLoadState({"loading":false})
        ).then(
            setChecked(false)

        )
    };
    const fetchStats = async() => {
        setLoadState({"loading":true})
        const data = await fetch(`/regions/${region_name}/stats`);
        const data_json = await data.json().then(
            data_json => setInitialData(data_json)
        ).then(
            setLoadState({"loading":false})
        )       
    }


    // const handleClick = async(e) => {
        
    //     console.log(checked.everChecked)
    //     if(checked.everChecked==false){
            
    //         console.log("CALLING FETCH STATS")
    //         fetchStats();

    //         console.log(checked.everChecked)
    //     }
    //     if(document.getElementById('stats-check').checked){
    //         console.log("TEST")
    //         setChecked({'checked':true,'everChecked':true});
    //     }else{
    //         console.log("TEST")
    //         setChecked({'checked':false,'everChecked':true});
    //     }
        
    // } 

    
    const checkFunction = () => {
        console.log("HELLO")
        // if (checked.checked == undefined) { return; }

        // const checkedState = checked.checked;

        // setChecked({'checked':!checkedState, 'everChecked':true});
        setChecked(!checked);
        if(!everChecked) {setEverChecked(true);}
        
    }
    
    if(LoadState.loading === false){
        return(
            <div id='main'>
                <Title checkFunction={checkFunction} isChecked={checked} statsOption='true' contents={`Select ${region_name} Brand`} />
                {checked == false?
                    <>{initialData.data?.map(brand => (<Link to={`./${brand.name}/`}><h2 className='actual-btn'>{brand.name}</h2></Link>))}</>
                :
                initialData.data?.map(brand =>
                <Link to={`./${brand.name}/`}>
                    <div className='card'>
                        <h2 className='no-margin'>{brand.name}</h2>
                        <h4 className='no-margin'>Annotated: {brand.num_annotated}/{brand.target_vehicle_count}</h4>
                        <h4 className='no-margin'>Ready To Annotate In Database: {brand.num_ready_to_annotate}</h4>
                    </div>
                </Link>)
                }
            </div> 
        );
    }else{
        return(
            <Loading />
        )
    }
    
}

/*

*/


export default Region;