import {Link, useParams} from 'react-router-dom';

import React, {createContext, useState} from 'react'; //ES6 js

import Loading from './Loading'
import Title from './Title';
import Region from './Region';

class MapIDAnnotate extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            state:"loading",
            secondsElapsed:0,
            data:[],
            vehicle_index:0,
            saveState:"saved",
            badMenuState:"off",
            infoState:0,
            dataInfo:null
        };
        //FUNCTION BINDS
        this.get_all_image_urls = this.getAllImageURLs.bind(this);
        this.get_unannotated_images_from_database = this.getUnannotatedImagesFromDatabase.bind(this);
        this.switch_state = this.switchState.bind(this);
        this.increase_index = this.increaseIndex.bind(this);
        this.decrease_index = this.decreaseIndex.bind(this);
        this.set_good = this.setGood.bind(this);
        this.set_bad = this.setBad.bind(this);
        this.save_annotations_to_database = this.saveAnnotationsToDatabase.bind(this);
        this.handle_key_press = this.handleKeyPress.bind(this);
        this.set_bad_input = this.setBadInput.bind(this);
    }
    //SET A TICKER FOR EVERY 1000ms (1 second)
    componentDidMount(){
        this.interval = setInterval(() => this.tick(), 1000);
        document.addEventListener("keydown",this.handle_key_press);
        this.getUnannotatedImagesFromDatabase();
        //document.getElementById('title').addEventListener("onmouseenter",() => this.state.infoState=1)
        //document.getElementById('title').addEventListener("onmouseleave",() => this.state.infoState=0)

    }
    componentWillUnmount(){
        clearInterval(this.interval);
        document.removeEventListener("keydown", this.handle_key_press);
        //document.getElementById('title').removeEventListener("onmouseenter")
        //document.getElementById('title').removeEventListener("onmouseleave")
    }
    componentDidUpdate(){
        document.getElementById('title')?.addEventListener("mouseenter",() => this.state.infoState=1)
        document.getElementById('title')?.addEventListener("mouseleave",() => this.state.infoState=0)
        //document.getElementById('other-annotation')?.addEventListener("")
    }
    //
    tick(){
        this.changeLoadState();
        this.setState((prevState) => ({
            secondsElapsed: prevState.secondsElapsed + 1,
        }));
    }
    
    changeLoadState(prevState){
        this.setState((prevState) => ({
            secondsElapsed:prevState.secondsElapsed+1,
        }));
    }

    switchState(newState){
        this.state.state = newState;
    }


    getUnannotatedImagesFromDatabase(){
        
        this.switchState("loading");
        const fetchImages = async() => {
            this.state.vehicle_index=0;
            const data = await fetch(`./get_unannotated_images_from_database`);
            const data_json = await data.json().then(
                json => {this.state.data = json.data;this.state.dataInfo=json.data_info}
            ).then(
                this.switchState("annotate")
            ); 
        };
        fetchImages();
       
    }
    getAllImageURLs(){
        const fetchURLs = async() => {
            const data = await fetch(`./get_all_image_urls`);
            const data_json = await data.json().then(
                json => this.state.data = json.data
            ).then(
                this.switchState("all")
            ); 
        };
        fetchURLs();
        console.log(this.state.data) 
    }
    saveAnnotationsToDatabase(){
        for(let car of this.state.data.values()){
            console.log('car')
            console.log(car)
            car.fl = 'None'
            car.fr = 'None'
            car.rl = 'None'
            car.rr = 'None'
        }
        const sendAnnotations = async() => {        
                const response = await fetch(`./save`,{
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(this.state.data)
            })
            await response.json().then(
                json => {this.state.data = json.data;this.state.dataInfo=json.data_info}).then(
                    this.setState(() => ({
                        saveState: 'saved',
                        vehicle_index:0
                    }))
            ).then(
                console.log("DONE")
            );
        };
        this.setState(() => ({
            saveState: 'saving'
        }));
        sendAnnotations();
    }
    increaseIndex(){
        if(this.state.vehicle_index < this.state.data.length-1){
            this.state.vehicle_index += 1;
        }
    }
    decreaseIndex(){
        if(this.state.vehicle_index > 0){
            this.state.vehicle_index -= 1;
        }
    }
    setGood(){
        this.state.data[this.state.vehicle_index].annotated = 1;
        this.state.data[this.state.vehicle_index].notes = 'Good';
        this.flashBackground('green')
        this.increaseIndex();
    }
    setBad(notes){
        this.state.data[this.state.vehicle_index].annotated = 1;
        this.state.data[this.state.vehicle_index].notes = notes;
        this.flashBackground('red')
        this.increaseIndex();
    }
    setBadInput(event,text){
        event.preventDefault();
        console.log(event)
        console.log(text)
        this.set_bad(text)
    }
    switchBadMenu(){
        this.state.badMenuState = this.state.badMenuState == "off"? "on" : "off";
    }
    flashBackground(color){
        if(color == 'green'){
            document.getElementById('App-header').classList.remove('red-flash');
            document.getElementById('App-header').classList.add('green-flash');
            setTimeout(() => document.getElementById('App-header').classList.remove('green-flash'),1000);
        }else if(color == 'red'){
            document.getElementById('App-header').classList.remove('red-flash');
            document.getElementById('App-header').classList.add('red-flash');
            setTimeout(() => document.getElementById('App-header').classList.remove('red-flash'),1000);
        }
    }
    handleKeyPress(event){
        console.log(event)
        switch(event.key){
            case ' ':
                if(document.getElementById('other-annotation') != document.activeElement){
                this.set_good();}
                break;
            case '0':
                this.set_bad("close");
                break;
            case '1':
                this.set_bad("Fast");
                break;
            case '2':
                this.set_bad("wrongCar");
                break;
            case '3':
                this.set_bad("light");
                break;
            case '4':
                this.set_bad("turn");
                break;
            case '5':
                this.set_bad("blocked");
                break;
            case '6':
                this.set_bad("dark");
                break;
            case '7':
                this.set_bad("snow");
                break;
            case '8':
                this.set_bad("duplicate");
                break;
            case '9':
                this.set_bad("damage");
                break;
            case '-':
                this.set_bad("no car");
                break;
            case '+':
                this.set_bad("People");
                break;
            case '=':
                this.set_bad("People");
                break;
            case '*':
                this.set_bad("trunk");
                break;
            case '`':
                this.set_bad("trunk");
                break;
            case 'ArrowLeft':
                this.decreaseIndex();

                break;
            case 'ArrowRight':
                this.increaseIndex();
                break;
            case 'Enter':
                if(document.getElementById('other-annotation') == document.activeElement){
                this.set_bad(document.getElementById('other-annotation').value);
                document.getElementById('other-annotation').value='';
                document.getElementById('other-annotation').blur();}
                break;
            case 'Escape':
                document.getElementById('other-annotation').blur();
                break;
            default:
                /*
                if(event.key == 'Backspace'){
                    
                    if(document.getElementById('other-annotation').value.length >0){
                        console.log("BACKKK")
                        document.getElementById('other-annotation').value = document.getElementById('other-annotation').value.slice(0,-1);
                    }
                }
                else{document.getElementById('other-annotation').value += event.key}
                */
                document.getElementById('other-annotation').focus();
                break;
        }
    }
    render(){
    //WHEN DATA IS LOADING
    switch(this.state.state){
    case "annotate":
        const vehicle_object = this.state.data?this.state.data[this.state.vehicle_index]:null;
        return(
            
            <div onKeyDown={this.handle_key_press}>
                {this.state.data?.length> 0 ?
                <>
                <img onClick={this.get_unannotated_images_from_database} className='refresh' src='/static/images/refresh.png'></img>
                <div id='vehicle-status'>
                    {this.state.data[this.state.vehicle_index]?.annotated == 0? <><h1 className='no-margin'>Annotated as</h1><h2 className='no-margin'>Unannotated</h2></>:
                    <><h1 className='no-margin'>Annotated as</h1>
                    {this.state.data[this.state.vehicle_index]?.notes == 'Good'?
                    <h2 className='no-margin positive'>{this.state.data[this.state.vehicle_index]?.notes}</h2>:
                    <h2 className='no-margin negative'>{this.state.data[this.state.vehicle_index]?.notes}</h2>}</>}
                </div>
                <div id='save-btn'>
                    {this.state.saveState == 'saved'?
                    <h1 onClick={this.save_annotations_to_database} className ='actual-btn'>Save All To Database</h1>:
                    <h1 className ='actual-btn'>Saving</h1>
                    }     
                </div></>
                :null}
                
               


                <Title subheading={this.state.dataInfo?.name} contents={`${this.props.map_id} Annotation`} />
                <div id='image-nav'>
                    <img onClick={this.decrease_index} className = 'point-arrow' src='/static/images/left-arrow.png'></img>
                    <h2 id='vehicle-index' >Vehicle {this.state.data?.length>0?this.state.vehicle_index+1:0}/{this.state.data?.length}</h2>
                    <img onClick={this.increase_index} className = 'point-arrow' src='/static/images/right-arrow.png'></img>
                </div>
                
                {this.state.data?.length> 0 ?
                <div>
                <div className=''>
                    <div className='image-card left-image'><h5 className=''>Front Left</h5>
                    {vehicle_object?.FL.map(image =>
                        <img className='tiny-image' src={`data:image/png;base64,${image}`}></img>)
                    }</div>
                    <div className='image-card right-image'><h5 className=''>Front Right</h5>
                    {vehicle_object?.FR.map(image =>
                        <img className='tiny-image' src={`data:image/png;base64,${image}`}></img>)
                    }</div>
                    
                    <div className='image-card left-image'><h5 className=''>Rear Left</h5>
                    {vehicle_object?.RL.map(image =>
                        <img className='tiny-image' src={`data:image/png;base64,${image}`}></img>)
                    }</div>
                    <div className='image-card right-image'><h5 className=''>Rear Right</h5>
                    {vehicle_object?.RR?.map(image =>
                        <img className='tiny-image' src={`data:image/png;base64,${image}`}></img>)
                    }</div>
                </div>
                <div id='control-panel'>
                        <h2 onClick={this.set_good} className='control-btn positive positive-btn'>Good(Space)</h2>
                        <h2 onClick={() => this.set_bad("close")} className='control-btn negative negative-btn'>close(0)</h2>
                        <h2 onClick={() => this.set_bad("Fast")} className='control-btn negative negative-btn'>Fast(1)</h2>
                        <h2 onClick={() => this.set_bad("wrongCar")} className='control-btn negative negative-btn'>wrongCar(2)</h2>
                        <h2 onClick={() => this.set_bad("light")} className='control-btn negative negative-btn'>light(3)</h2>
                        <h2 onClick={() => this.set_bad("turn")} className='control-btn negative negative-btn'>turn(4)</h2>
                        <h2 onClick={() => this.set_bad("blocked")} className='control-btn negative negative-btn'>blocked(5)</h2>
                        <h2 onClick={() => this.set_bad("dark")} className='control-btn negative negative-btn'>dark(6)</h2>
                        <h2 onClick={() => this.set_bad("snow")} className='control-btn negative negative-btn'>snow(7)</h2>
                        <h2 onClick={() => this.set_bad("duplicate")} className='control-btn negative negative-btn'>duplicate(8)</h2>
                        <h2 onClick={() => this.set_bad("damage")} className='control-btn negative negative-btn'>damage(9)</h2>
                        <h2 onClick={() => this.set_bad("no car")} className='control-btn negative negative-btn'>no car(-)</h2>
                        <h2 onClick={() => this.set_bad("People")} className='control-btn negative negative-btn'>People(+/=)</h2>
                        <h2 onClick={() => this.set_bad("trunk")} className='control-btn negative negative-btn'>trunk(*/`)</h2>
                        <input name='textbox' id='other-annotation' type='text'></input>
                </div>
                </div>
                :<h2>Rendering or No Vehicles</h2>}
            </div>
        );
    break;
    case "all":
        return(
        <div>
            <h1>Data</h1>
            {this.state.data?.map((vehicle,count) =>
            <div>
                <h3 className='no-margin'>Vehicle {count+1}</h3>
                <h5>FL</h5>
                {vehicle.FL.map(image_url =>
                    <img className='tiny-image' src={`/static/SHValData/${this.props.region_name}/Val_${this.props.brand_name}/${this.props.map_id}/${vehicle.vehicle_string}/${image_url}`}></img>
                )}
                <h5>FR</h5>
                {vehicle.FR.map(image_url =>
                    <img className='tiny-image' src={`/static/SHValData/${this.props.region_name}/Val_${this.props.brand_name}/${this.props.map_id}/${vehicle.vehicle_string}/${image_url}`}></img>
                )}
                <h5>RL</h5>
                {vehicle.RL.map(image_url =>
                    <img className='tiny-image' src={`/static/SHValData/${this.props.region_name}/Val_${this.props.brand_name}/${this.props.map_id}/${vehicle.vehicle_string}/${image_url}`}></img>
                )}
                <h5>RR</h5>
                {vehicle.RR.map(image_url =>
                    <img className='tiny-image' src={`/static/SHValData/${this.props.region_name}/Val_${this.props.brand_name}/${this.props.map_id}/${vehicle.vehicle_string}/${image_url}`}></img>
                )}
            </div>)}
        </div>
        );
    break;
    /*
    case "menu":
        return(
            <div>
            <h1 className='actual-btn' onClick={this.get_unannotated_images_from_database}>Annotate From Database</h1>
            <h1 className='actual-btn' onClick={this.get_all_image_urls}>Get All Images (Depreciated)</h1>
            </div>
        );
    break;
    */
    case "loading":
        return(
        <div>
        
        <Loading />
        </div>
        );
    break;    
    }
    }
}

export default MapIDAnnotate;