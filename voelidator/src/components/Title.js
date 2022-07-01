import { Link } from "react-router-dom";

function Title(props){
    return(
        <>
        
        <div className='title' id='title'>
            
            <a href={props.url?props.url:'../'}><img className='back-btn' src='/static/images/back.png'></img></a>
            {props.statsOption=='true'?
                <div id='stats-option'>
                <label htmlFor='stats-check'>Show Stats?</label>
                <input name='stats-option' id='stats-check' checked={props.isChecked} onChange={props.checkFunction} type='checkbox'></input>
                </div>
            :null}
            {props.contents?<h1 className={props.subheading?'no-margin':''} >{props.contents}</h1>:null}
            {props.subheading?<h2 className='no-margin no-padding subheading'>{props.subheading}</h2>:null}
        </div>
        </>
    );
}

/*

*/


export default Title;