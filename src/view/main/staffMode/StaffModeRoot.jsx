import React, { Component } from 'react';
import { Card } from 'antd';
import StaffView from './StaffView';
import StaffTypeView from './StaffTypeView'

const tabListNoTitle = [{
    key: 'StaffView',
    tab: '员工概况',
}, {
    key: 'StaffTypeView',
    tab: '部门管理'
}
];

const contentListNoTitle = {
    StaffView: <StaffView />,
    StaffTypeView: <StaffTypeView />,
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

export default StaffModeRoot;