import React, { Component } from 'react';
import { Card } from 'antd'
import StaffView from './StaffView'
import StaffTypeView from './StaffTypeView'

const tabListNoTitle = [{
    key: 'StaffSetting',
    tab: '员工管理',
}, {
    key: 'StaffTypeSetting',
    tab: '员工类型',
}];

const contentListNoTitle = {
    StaffSetting: <StaffView />,
    StaffTypeSetting: <StaffTypeView />,
};

class SettingStaffModeRoot extends Component {
    state = {
        key: 'StaffSetting',
        noTitleKey: 'StaffSetting',
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {
        return (
            <div>
                <Card
                    style={{ width: '100%' }}
                    tabList={tabListNoTitle}
                    activeTabKey={this.state.noTitleKey}
                    onTabChange={(key) => { this.onTabChange(key); }}
                >
                    {contentListNoTitle[this.state.noTitleKey]}
                </Card>
            </div>
        );
    }
}

export default SettingStaffModeRoot;