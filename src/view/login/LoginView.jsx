import React, { Component } from 'react';
import {Button} from 'antd'

class LoginView extends Component {
    render() {
        return (
            <div>
                登录界面
                <Button onClick={this.loginHandler} type='primary'>登录测试</Button>
            </div>
        );
    }

    loginHandler=()=>{
        this.props.history.push('/mainView')
    }
}

export default LoginView;