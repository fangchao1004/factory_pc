import React, { Component } from 'react';
import { List, Icon } from 'antd';
export default class NoticeMenu extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [] }
    }
    componentDidMount() {
        // console.log('通知菜单 componentDidMount', this.props.data)
        this.setState({ data: this.props.data.filter((item) => item.hasNew) })
    }
    componentWillReceiveProps(nextProps) {
        // console.log('通知菜单 componentWillReceiveProps:', nextProps.data)
        setTimeout(() => {
            this.setState({ data: this.props.data.filter((item) => item.hasNew) })
        }, 100);
    }
    render() {
        return (
            <div style={{ width: 300 }}>
                <List
                    itemLayout="horizontal"
                    dataSource={this.state.data}
                    locale={{
                        emptyText: "所有消息已经查看",
                    }}
                    renderItem={item => (
                        <List.Item style={{ width: 300, cursor: "pointer" }}>
                            <List.Item.Meta
                                title={item.title}
                                onClick={() => {
                                    this.props.history.push(`/mainView/${item.route}`)
                                }}
                            />
                            <Icon type='right' style={{ fontSize: 10, color: '#ccc' }} />
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}
