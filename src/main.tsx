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

class Counter extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      count: 1,
      num: 2
    }
  }
  render(){
    // return React.createElement("button", {}, "0")
    return <button onClick={()=>{
      this.setState(state=>{
        return {
          count: state.count+1
        }
      })
      setTimeout(()=>{
        console.log(this.state)
      })
    }}>{this.state.count}</button>
  }
  // shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    // return false
  // }
}

const element = React.createElement(Counter)

ReactDOM.render(element, document.getElementById('root') as HTMLElement);

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(element)