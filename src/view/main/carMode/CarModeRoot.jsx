import React, { Component } from 'react';
import { Card } from 'antd';
import CarView from './CarView';
import AllCarView from './AllCarView'

const storage = window.localStorage;
var userinfo = null
var isAdmin = false;
var tabListNoTitle = [];

const contentListNoTitle = {
    CarView: <CarView />,
    AllCarView: <AllCarView />,
};

class CarModeRoot extends Component {
    state = {
        key: 'CarView',
        noTitleKey: 'CarView',
    }

    componentDidMount() {
        userinfo = storage.getItem('userinfo');
        isAdmin = JSON.parse(userinfo).isadmin === 1;
        tabListNoTitle = isAdmin ? [{
            key: 'CarView',
            tab: '个人车辆信息',
        }, {
            key: 'AllCarView',
            tab: '全部车辆信息'
        }] : [{
            key: 'CarView',
            tab: '个人车辆信息',
        }]
        this.forceUpdate();
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <Card
                bodyStyle={{ padding: 20 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default CarModeRoot;