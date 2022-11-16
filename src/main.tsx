// import React from 'react'
// import ReactDOM from 'react-dom/client'

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App/>
// )
import React from './react';
import ReactDOM from './react-dom';

const onClick = (e) => { console.log(e) };
// const element = <button onClick={onClick}>
//   say <span style={{color:'red'}}>Hello</span>
// </button>

const element = React.createElement('button', { style:{color: 'red'}, onClick }, 'say',
  React.createElement('span', { style: {color: 'green'} }, 'hello'));

console.log(element);
ReactDOM.render(element, document.getElementById('root') as HTMLElement);