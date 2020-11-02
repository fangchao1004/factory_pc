import React, { Component } from 'react';
import { Card } from 'antd';
import StaffView from './StaffView';
import StaffTypeView from './StaffTypeView'
import RoleView from './RoleView'
const tabListNoTitle = [{
    key: 'StaffView',
    tab: '员工信息',
}, {
    key: 'StaffTypeView',
    tab: '部门管理'
}, {
    key: 'RoleView',
    tab: '角色管理'
}
];

const contentListNoTitle = {
    StaffView: <StaffView />,
    StaffTypeView: <StaffTypeView />,
    RoleView: <RoleView />,
};

class StaffModeRoot extends Component {
    state = {
        key: 'StaffView',
        noTitleKey: 'StaffView',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                bodyStyle={{ backgroundColor: '#F1F2F5', padding: 10 }}
                tabList={tabListNoTitle}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default StaffModeRoot;