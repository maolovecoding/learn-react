// import React from 'react'
// import ReactDOM from 'react-dom/client'

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App/>
// )
import React from './react';
import ReactDOM from './react-dom';

const onClick = (e) => { e.persist();console.log(e) };
// const element = <button onClick={onClick}>
//   say <span style={{color:'red'}}>Hello</span>
// </button>
// console.log(<button onClick={onClick}>
//    say <span style={{color:'red'}}>Hello</span>
//  </button>)

// const element = React.createElement('button', { style:{color: 'red'}, onClick }, 'say',
  // React.createElement('span', { style: {color: 'green'}, onClick }, 'hello'));

// console.log(element);

class Counter<T = any> extends React.Component<T>{
  constructor(props:T) {
    super(props)
  }
  render(){
    // return React.createElement("button", {}, "0")
    return <button onClick={()=>{console.log(1)}}>0</button>
  }
}

const element = React.createElement(Counter)

ReactDOM.render(element, document.getElementById('root') as HTMLElement);