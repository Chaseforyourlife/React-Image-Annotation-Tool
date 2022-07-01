import {Link, useParams} from 'react-router-dom';

import React, {createContext, useState} from 'react'; //ES6 js

import Loading from './Loading'
import Title from './Title';
import Region from './Region';

//TODO make vars file
//VARIABLES
const WAIT_TIME = 15


class MapIDBID extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            emailData:{
                emailNum:0,
                emailOfNum:0
            },
            flashState:false,
            flashType:'alert',
            flashMessage:'',
            state:"loading",
            secondsElapsed:0,
            secondsWaited:0,
            data:[],
            vehicle_index:0,
            saveState:"saved",
            badMenuState:"off",
            infoState:0,
            dataInfo:null,
            form:{
                worksiteString:"",
                startDate:"",
                endDate:""
            }

        };
        //FUNCTION BINDS
        this.handle_key_press = this.handleKeypress.bind(this);
        this.set_max_date = this.setMaxDate.bind(this);
        this.get_max_date = this.getMaxDate.bind(this);
        this.set_state = this.setState.bind(this);
        this.submit_form = this.submitForm.bind(this);
    }
    getStatsData(){
        const fetchURLs = async() => {
            const data = await fetch(`./stats`);
            const data_json = await data.json().then(
                json => this.state.data = json.data
            ).then(
                this.switchState("interface")
            ); 
        };
        fetchURLs();
        console.log(this.state.data)
    }
    componentDidMount(){
        
        this.interval = setInterval(() => this.tick(), 500);
        document.addEventListener("keydown",this.handle_key_press);
        //document.getElementById('title').addEventListener("onmouseenter",() => this.state.infoState=1)
        //document.getElementById('title').addEventListener("onmouseleave",() => this.state.infoState=0)
        this.getStatsData()
        //document.getElementById('App-header').style.backgroundColor = 'var(--primary-color)'
        
        
    }
    componentWillUnmount(){
        clearInterval(this.interval);
        document.removeEventListener("keydown", this.handle_key_press);
        //document.getElementById('title').removeEventListener("onmouseenter")
        //document.getElementById('title').removeEventListener("onmouseleave")
    }
    componentDidUpdate(){
    }
    //
    tick(){
        this.setState((prevState) => ({
            secondsElapsed: prevState.secondsElapsed + .5
        }));
        this.updateFlash();
        if(this.state.state == 'waiting'){
            console.log("WAIT")
            this.setState((prevState) => ({
                secondsWaited: prevState.secondsWaited + .5
            }));
            if(this.state.secondsWaited >= WAIT_TIME){
               console.log('RESET TIMER')
                this.resetTimer();
                this.checkEmails();
            
            }
        }
       
    }
    resetTimer(){
        this.setState((prevState)=> ({
            secondsWaited:0
        }))
        console.log(this.state.secondsWaited)
    }
    checkEmails(){
        const sendForm = async() => {  
            this.state.saveState = "saving"      
            const data = await fetch(`./check_emails`,{
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(this.state.form)
            }).then(
                response => response.json()
            ).then(
                json => this.state.emailData = json
            );
        };
        sendForm();
        console.log(this.state.emailData)
    }


    updateFlash(){
        if(this.state.flashState == true){
            if(document.getElementById('flash')){
                console.log('set_value')
                const flash = document.getElementById('flash')
                flash.textContent = this.state.flashMessage
                flash.style.backgroundColor = this.state.flashType=='success'?'green':'red'
            }
        }
    }

    getMaxDate(){
        console.log("HELLo")
        var today = new Date();
        today.setDate(today.getDate()-1)
        var yesterday = today
        var dd = yesterday.getDate();
        var mm = yesterday.getMonth()+1; //January is 0!
        var yyyy = yesterday.getFullYear();
        if(dd<10) {
            dd = '0'+dd
        } 
        if(mm<10) {
            mm = '0'+mm
        } 
        yesterday = yyyy + '-' + mm + '-' + dd;
        return yesterday
    }
    setMaxDate(){
        console.log("HELLo")
        var today = new Date();
        today.setDate(today.getDate()-1)
        var yesterday = today
        var dd = yesterday.getDate();
        var mm = yesterday.getMonth()+1; //January is 0!
        var yyyy = yesterday.getFullYear();
        if(dd<10) {
            dd = '0'+dd
        } 
        if(mm<10) {
            mm = '0'+mm
        } 
        yesterday = yyyy + '-' + mm + '-' + dd;
        document.getElementById('startDate').max = yesterday
        document.getElementById('endDate').max = yesterday
    }
    //display text to the user
    flash(message,type='alert'){
        this.state.flashState = true
        this.state.flashMessage = message
        //TODO
        console.log(message)
    }
    handleKeypress(){

    }
    switchState(newState){
        this.state.state = newState;
    }
    //Set state.form to user input and check if form is correct
    submitForm(){
        this.state.form.worksiteString = document.getElementById('worksite-list').value
        this.state.form.startDate = document.getElementById('startDate').value
        this.state.form.endDate = document.getElementById('endDate').value
        console.log(this.confirmDates(this.state.form.startDate,this.state.form.endDate))
        if(this.state.form.worksiteString == ''){
            this.flash('Enter Worksite(s)')
        }
        else if(this.confirmDates(this.state.form.startDate,this.state.form.endDate)){
            this.uploadForm()
        }else{
            this.flash('Check Start And End Date')
        }
    }
    //Return whether or not date string is at or before the other date string
    confirmDates(date1,date2){

        const [y1_s,m1_s,d1_s] = date1.split("-");
        const [y2_s,m2_s,d2_s] = date2.split("-");
        console.log(y1_s)
        const [y1,m1,d1,y2,m2,d2] = [y1_s,m1_s,d1_s,y2_s,m2_s,d2_s].map(s => parseInt(s))
        console.log(y1,m1,d1,y2,m2,d2)
        
        if(y1 < y2){
            return true;
        }else if(y1 > y2){
            return false;
        }else if(m1 < m2){
            return true;
        }else if(m1 > m2){
            return false;
        }else if(d1 <= d2){
            return true;
        }else if(d1 > d2){
            return false;
        }
    }
    uploadForm(){
        const sendForm = async() => {  
            this.state.saveState = "saving"      
            const data = await fetch(`./upload_bid_form`,{
                'method':'POST',
                headers : {
                    'Content-Type':'application/json'
                },
                body:JSON.stringify(this.state.form)
            }).then(response => response.json()).then(
                json => {}).then(
                this.state.saveState = "saved"
            ).then(
                this.switchState('waiting')
            ).then(
                this.state.secondsWaited = 0
            );
        };
        sendForm();
    }


    render(){
    //WHEN DATA IS LOADING
    switch(this.state.state){
    
    case "waiting":
        return(
        <div id='waiting'>
            <h1>Waiting for Emails</h1>
            <h2>Email {this.state.emailData.emailNum} of {this.state.emailData.emailOfNum} Recieved</h2>
        </div>
        );
    break;
    
    case "interface":
        return(
        <div className='white-back' onLoad={this.set_max_date}>
            
            <Title contents={"Bulk Image Downloader" +" - "+ this.props.map_id} />
            {this.state.flashState? <h3 id='flash'></h3>: null}
            {this.state.data?.map(map_id => (
                <div>
                    <div  className='card-no-hover'>
                    <h2 className="no-margin">Region: {this.props.region_name}</h2>
                    <h2 className="no-margin">Make: {this.props.brand_name}</h2>
                    <h2 className="no-margin">Model: {map_id.model}</h2>
                    <h2 className='no-margin'>Annotated: {map_id.num_annotated}/{map_id.target_num}</h2>
                    <h2 className='no-margin'>Ready To Annotate In Database: {map_id.num_ready_to_annotate}</h2>
                    </div>
                    <div className='card-no-hover'>
                    <h2 className='no-margin'>Worksites:</h2>
                    <input name='textbox' id='worksite-list'  type='text'></input>
                    <br></br>
                    <label htmlFor="startDate">Start date:</label>
                    <input type="date" id="startDate" name="start-date" min="2018-01-02" ></input>
                    <br></br>
                    <label htmlFor="endDate">End date:</label>
                    <input   type="date" id="endDate" name="end-date" min="2018-01-02"></input>
                    <br></br>
                    </div>
                    <h2 onClick={this.submit_form} className='actual-btn'> Submit</h2>
                </div>
            ))}
        </div>
        );
    break;
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

export default MapIDBID;