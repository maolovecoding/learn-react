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

class Demo extends React.Component {
  componentWillMount() {
    console.log("Demo componentWillMount 组件将要挂载");
  }
  componentWillUnmount() {
    console.log("Demo componentWillUnmount 组件将要卸载");
  }
  render() {
    console.log("demo");
    return <span>我是组件</span>;
  }
}

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
    console.log("Counter constructor 构造函数");
  }
  componentWillMount() {
    console.log("Counter componentWillMount 组件将要挂载");
  }
  componentDidMount() {
    console.log("Counter componentDidMount 组件挂载完毕");
  }
  shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    console.log("Counter shouldComponentUpdate 组件是否需要更新");
    return true;
  }
  componentWillUpdate(): void {
    console.log("Counter componentWillUpdate 组件将要更新");
  }
  componentDidUpdate(): void {
    console.log("Counter componentDidUpdate 组件更新完毕");
  }
  componentWillUnmount() {
    console.log("Counter componentWillUnmount 组件将要卸载");
  }
  render() {
    console.log("Counter render 渲染完成");
    // setTimeout(() => {
    //   this.setState({
    //     count: this.state.count + 1,
    //   });
    // }, 3000);
    return this.state.count % 2 ? React.createElement(Demo) : <span>你好</span>;
    // return this.state.count % 2 ? (
    //   // <ul>
    //   //   <li key="A">A</li>
    //   //   <li key="B">B</li>
    //   //   <li key="C">C</li>
    //   //   <li key="D">D</li>
    //   //   <Demo/>
    //   // </ul>
    //   <Demo />
    // ) : (
    //   <ul>
    //     <li key="A">A</li>
    //     <li key="C">C</li>
    //     <li key="B">B</li>
    //     <li key="E">E</li>
    //     <li key="F">F</li>
    //   </ul>
    // );
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
