import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {

    render() {
        return (
            <button
                className="square"
                onClick={() => this.props.onclick()}
            >
                {this.props.value}
            </button>
        );
    }
}

class Board extends React.Component {

    // 这个方法返回的是一个 <Square/> 标签，可以理解为向 Square 组件传值
    // 默认传的值，在 Square 里调用时，都会用 props.XXX 的形式。
    renderSquare(i) {
        return <Square value={this.props.squares[i]}
                       onclick={() => this.props.onClick(i)}
                />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

            // squares 是一个长度为 9 的数组，保存了 9 个格子的状态
            // history 是一个不断增加内容的数组，保存了每一步的历史记录
            // horizon 是落子的横坐标
            // vertical 是落子的纵坐标
            history: [{
                squares: Array(9).fill(null),
                horizon: null,
                vertical: null,
            }],

            // 判断下一个落子者是否是 'X'
            xIsNext: true,

            // 代表第几步历史记录
            stepNumber: 0,
        };
    }

    /*
    * 点击某个方格，触发的动作，参数只有索引值 i，意思是把 squares 的第 i 个元素上落下棋子。
    * */
    handleClick(i){

        // 如果我们“回到过去”，然后再走一步新棋子，原来的“未来”历史记录就不正确了，
        // 这样表示 history 可以保证我们把这些“未来”的不正确的历史记录丢弃掉。
        const history = this.state.history.slice(0, this.state.stepNumber + 1);

        // 先获取目前历史记录中的最后一条
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        // 落子横坐标确定
        const horizon = i % 3;

        // 落子纵坐标确定
        const vertical = parseInt(i / 3);

        // 如果已经决出胜者了，那么就不做事了，直接返回
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        // 在历史记录的最后一条的基础上改动，根据 xIsNext 来判断是画 X，还是画 O
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        // 添加历史记录，并且把 xIsNext 置反，并且把步数记录为 history 数组的长度
        this.setState({
            history: history.concat([{squares: squares, horizon: horizon, vertical: vertical}]),
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
        });
    }

    /*
    * 跳回某一步历史
    * */
    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    render() {

        // 渲染到最终的页面时，hostory 就是目前的；current 是按照 stepNumber 来索引；winner 是根据 current 来计算。
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const stepNumber = this.state.stepNumber;

        // 把历史步骤映射为代表按钮的 React 元素，然后可以展示出一个按钮的列表，点击这些按钮，可以“跳转”到对应的历史步骤
        const moves = history.map((step, move) => {

            // 每一次落子的横纵坐标以及落子角色（叉叉或圆圈）
            const oneMoveHorizon = step.horizon;
            const oneMoveVertical = step.vertical;

            const buttonDescribe = move ?
                '第' + move + '步' + ' (' + oneMoveHorizon + ',' + oneMoveVertical + ') '
                : '回到初始棋盘';

            // 当前步数，按钮的样式为红底
            const currentMoveStyle = {backgroundColor: '#ff0000'};

            // 其他按钮的样式
            const otherMoveStyle = {};

            // 返回一个 button 列表，可以回到任意一个历史时刻
            return (
              <li key={move} >
                  <button onClick={() => this.jumpTo(move)}
                          style={move === stepNumber ? currentMoveStyle : otherMoveStyle}>
                      {buttonDescribe}
                  </button>
              </li>
            );
        })

        // 每次渲染前先判断胜者，若有胜者就显示出胜者，没有胜者就显示下一个落子者
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares = {current.squares}
                        onClick = {(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

/*
* 公共方法，判断胜者
* */
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

