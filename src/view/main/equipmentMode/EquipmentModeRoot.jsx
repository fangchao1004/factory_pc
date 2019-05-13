import React, { Component } from 'react';
import { Card } from 'antd';
import EquipmentView from './EquipmentView'
import EquipmentTypeView from './EquipmentTypeView'

const tabListNoTitle = [{
    key: 'EquipmentView',
    tab: '设备管理',
}, {
    key: 'EquipmentTypeView',
    tab: '设备类型管理',
}];

const contentListNoTitle = {
    EquipmentView: <EquipmentView />,
    EquipmentTypeView: <EquipmentTypeView />,
};

class EquipmentModeRoot extends Component {
    state = {
        key: 'EquipmentView',
        noTitleKey: 'EquipmentView',
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

export default EquipmentModeRoot;