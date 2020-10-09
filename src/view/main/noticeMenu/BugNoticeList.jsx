import React, { Component } from 'react';
import { List, Avatar, Tag, Button } from 'antd';
import { omitTextLength, removeOneBugIdFromList } from '../../util/Tool';
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showBugNum } from '../../../redux/actions/BugAction';
class BugNoticeList extends Component {
    constructor(props) {
        super(props);
        let localUserInfo = window.localStorage.getItem('userinfo')
        // console.log('localUserInfo:', localUserInfo)
        this.state = {
            dataSource: [], modalVisible: false, selectItem: null,
            permissionManager: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1,
            major_id_all: JSON.parse(localUserInfo).major_id_all
        }
    }
    componentDidMount() {
        this.props.data.unreadBugs.map((item, index) => {
            item.key = index;
            switch (item.status) {
                case 0:
                    item.stauts_people = '维修';
                    item.avatar_color = '#13c2c2';
                    item.tag_des = '待维修'
                    break;
                case 1:
                    item.stauts_people = '维修';
                    item.avatar_color = '#13c2c2';
                    break;
                case 2:
                    item.stauts_people = '专工';
                    item.avatar_color = '#eb2f96';
                    break;
                case 3:
                    item.stauts_people = '运行';
                    item.avatar_color = '#fa541c';
                    break;
                case 6:
                    item.stauts_people = '专工';
                    item.avatar_color = '#eb2f96';
                    break;
                case 7:
                    item.stauts_people = '专工';
                    item.avatar_color = '#eb2f96';
                    break;
                default:
                    break;
            }
            return item
        })
        this.setState({ dataSource: this.props.data.unreadBugs })
    }
    render() {
        return (
            <div>
                <List
                    style={{ height: 300, overflow: 'scroll' }}
                    itemLayout="horizontal"
                    dataSource={this.state.dataSource}
                    renderItem={item => (
                        <List.Item
                            extra={
                                <Button type='link' size="small" style={{ padding: 0, marginRight: 8 }} onClick={() => {
                                    if (this.state.permissionManager && this.state.major_id_all) { ///有专工权限且要有专业，就直接跳转
                                        this.props.closePop()
                                        this.props.history.push('./bugAboutMe')
                                        setTimeout(() => {
                                            Store.dispatch(showBugNum(item.id))
                                        }, 500);
                                    } else {
                                        console.log('没有专工权限或者是没有专业，选择的是:', item)
                                        this.props.closePopAndOpenModal(item)
                                    }
                                    HttpApi.obs({ sql: `update bugs set isread = 1 where id = ${item.id}` }, (res) => {
                                        if (res.data.code === 0) {
                                            ///将缓存中的对应缺陷id 剔除
                                            // console.log('将缓存中的对应缺陷id 剔除')
                                            removeOneBugIdFromList(item.id)
                                        }
                                    })
                                }}>详情</Button>}
                        >
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: item.avatar_color, verticalAlign: 'middle' }} size="large">{item.stauts_people}</Avatar>}
                                title={<Tag color={'blue'}>编号:{item.id}-{item.tag_des}</Tag>}
                                description={
                                    <div>
                                        <div>{omitTextLength(JSON.parse(item.content).text, 20)}</div>
                                        <div>{item.last_status_time ? moment(item.last_status_time, 'YYYY-MM-DD HH:mm:ss').fromNow() : moment(item.createdAt).utcOffset(0).fromNow()}</div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        );
    }
}

export default BugNoticeList;