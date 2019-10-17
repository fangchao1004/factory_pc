import React, { Component } from 'react';
import { Card } from 'antd';
import EquipmentView from './equipment/EquipmentView'
import EquipmentTypeView from './type/EquipmentTypeView'
import EquipmentArea1View from './area1/EquipmentArea1View'
import EquipmentArea2View from './area2/EquipmentArea2View'
import EquipmentArea3View from './area3/EquipmentArea3View'

const tabListNoTitle = [{
    key: 'EquipmentView',
    tab: '巡检点管理',
}];

const tabListNoTitle2 = [{
    key: 'EquipmentTypeView',
    tab: '巡检点类型管理',
}, {
    key: 'EquipmentArea1View',
    tab: '一级巡检区域',
}, {
    key: 'EquipmentArea2View',
    tab: '二级巡检位置',
}, {
    key: 'EquipmentArea3View',
    tab: '三级设备范围',
}];

const contentListNoTitle = {
    EquipmentView: <EquipmentView />,
    EquipmentTypeView: <EquipmentTypeView />,
    EquipmentArea1View: <EquipmentArea1View />,
    EquipmentArea2View: <EquipmentArea2View />,
    EquipmentArea3View: <EquipmentArea3View />,
};

class EquipmentModeRoot extends Component {
    state = {
        key: 'EquipmentView',
        noTitleKey: 'EquipmentView',
        isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin
    }

    onTabChange = (key) => {
        this.setState({ noTitleKey: key });
    }

    render() {

        var tabs
        if (this.state.isAdmin) {
            tabs = tabListNoTitle.concat(tabListNoTitle2)
        } else {
            tabs = tabListNoTitle
        }

        return (
            <Card
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabs}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}

export default EquipmentModeRoot;