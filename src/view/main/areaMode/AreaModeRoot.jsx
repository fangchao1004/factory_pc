import React, { Component } from 'react';
import { Card } from 'antd';
import EquipmentArea0View from './area0/EquipmentArea0View'
import EquipmentArea1View from './area1/EquipmentArea1View'
import EquipmentArea2View from './area2/EquipmentArea2View'
import EquipmentArea3View from './area3/EquipmentArea3View'
import TreeView from './tree/TreeView'

const tabListNoTitle = [{
    key: 'TreeView',
    tab: '分级展示',
}];

const tabListNoTitle2 = [{
    key: 'EquipmentArea0View',
    tab: '厂区',
}, {
    key: 'EquipmentArea1View',
    tab: '一级巡检区域',
}, {
    key: 'EquipmentArea2View',
    tab: '二级巡检位置',
}, {
    key: 'EquipmentArea3View',
    tab: '三级巡检点范围',
}];

const contentListNoTitle = {
    TreeView: <TreeView />,
    EquipmentArea0View: <EquipmentArea0View />,
    EquipmentArea1View: <EquipmentArea1View />,
    EquipmentArea2View: <EquipmentArea2View />,
    EquipmentArea3View: <EquipmentArea3View />,
};

class AreaModeRoot extends Component {
    state = {
        key: 'TreeView',
        noTitleKey: 'TreeView',
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
                bodyStyle={{ padding: 20 }}
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

export default AreaModeRoot;