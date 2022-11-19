// import React from 'react'
// import ReactDOM from 'react-dom/client'

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App/>
// )
import React from "./react";
import ReactDOM from "./react-dom";

const onClick = (e) => {
  e.persist();
  console.log(e);
};
// const element = <button onClick={onClick}>
//   say <span style={{color:'red'}}>Hello</span>
// </button>
// console.log(<button onClick={onClick}>
//    say <span style={{color:'red'}}>Hello</span>
//  </button>)

// const element = React.createElement('button', { style:{color: 'red'}, onClick }, 'say',
// React.createElement('span', { style: {color: 'green'}, onClick }, 'hello'));

// console.log(element);

const Text = (props) => <span id={props.id}>我是函数式组件</span>;

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
      num: 2,
    };
    setTimeout(() => {
      this.setState({
        count: this.state.count + 1,
      });
    }, 1000);
  }
  render() {
    // setTimeout(() => {
    //   this.setState({
    //     count: this.state.count + 1,
    //   });
    // }, 3000);
    return this.state.count % 2 ? (
      <ul>
        <li key="A">A</li>
        <li key="B">B</li>
        <li key="C">C</li>
        <li key="D">D</li>
      </ul>
    ) : (
      <ul>
        <li key="A">A</li>
        <li key="C">C</li>
        <li key="B">B</li>
        <li key="E">E</li>
        <li key="F">F</li>
      </ul>
    );
    // return React.createElement("button", {}, "0")
    // return <button onClick={()=>{
    //   this.setState(state=>{
    //     return {
    //       count: state.count+1
    //     }
    //   })
    //   setTimeout(()=>{
    //     console.log(this.state)
    //   })
    // }}>{this.state.count}<Text id={this.state.count}/></button>
    // return this.state.count % 2
    //   ? React.createElement(Text)
    //   : React.createElement(Text, { id: "aaa" + this.state.count });
  }
  // shouldComponentUpdate(nextProps: any, nextState: any): boolean {
  // return false
  // }
}

const element = React.createElement(Counter);

ReactDOM.render(element, document.getElementById("root") as HTMLElement);

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(element)
