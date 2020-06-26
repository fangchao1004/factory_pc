import React, { Component } from 'react';
import { Card } from 'antd';
import EquipmentView from './equipment/EquipmentView'
import EquipmentTypeView from './type/EquipmentTypeView'

const tabListNoTitle = [{
    key: 'EquipmentView',
    tab: '巡检点管理',
}];
const tabListNoTitle2 = [{
    key: 'EquipmentTypeView',
    tab: '巡检点类型管理',
}];
class EquipmentModeRoot extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 'EquipmentView',
            noTitleKey: 'EquipmentView',
            isAdmin: JSON.parse(window.localStorage.getItem('userinfo')).isadmin
        }
        this.contentListNoTitle = {
            EquipmentView: <EquipmentView {...props} />,
            EquipmentTypeView: <EquipmentTypeView {...props} />,
        };
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
                bodyStyle={{ padding: 10 }}
                bordered={false}
                style={{ width: '100%' }}
                tabList={tabs}
                activeTabKey={this.state.noTitleKey}
                onTabChange={(key) => { this.onTabChange(key); }}
            >
                {this.contentListNoTitle[this.state.noTitleKey]}
            </Card>
        );
    }
}
export default EquipmentModeRoot;