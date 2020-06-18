import React, { Component } from 'react';
import { List, Skeleton, Avatar, Tag } from 'antd';
import { omitTextLength } from '../../util/Tool';
import HttpApi from '../../util/HttpApi';
import moment from 'moment'
import Store from '../../../redux/store/Store';
import { showBugNum } from '../../../redux/actions/BugAction';
class BugNoticeList extends Component {
    constructor(props) {
        super(props);
        let localUserInfo = window.localStorage.getItem('userinfo')
        this.state = {
            dataSource: [], modalVisible: false, selectItem: null,
            permissionManager: JSON.parse(localUserInfo).permission && JSON.parse(localUserInfo).permission.split(',').indexOf('0') !== -1,
        }
    }
    componentDidMount() {
        this.props.data.map((item, index) => {
            item.key = index;
            switch (item.status) {
                case 0:
                    item.stauts_people = '给维修';
                    item.avatar_color = '#13c2c2';
                    item.tag_des = '待维修'
                    break;
                case 1:
                    item.stauts_people = '给维修';
                    item.avatar_color = '#13c2c2';
                    break;
                case 2:
                    item.stauts_people = '给专工';
                    item.avatar_color = '#eb2f96';
                    break;
                case 3:
                    item.stauts_people = '给运行';
                    item.avatar_color = '#fa541c';
                    break;
                case 6:
                    item.stauts_people = '给专工';
                    item.avatar_color = '#eb2f96';
                    break;
                case 7:
                    item.stauts_people = '给专工';
                    item.avatar_color = '#eb2f96';
                    break;
                default:
                    break;
            }
            return item
        })
        this.setState({ dataSource: this.props.data })
    }
    render() {
        return (
            <div >
                <List
                    style={{ height: 300, overflow: 'scroll' }}
                    itemLayout="horizontal"
                    dataSource={this.state.dataSource}
                    renderItem={item => (
                        <List.Item
                            actions={[<a onClick={() => {
                                if (this.state.permissionManager) { ///只要有专工权限，就直接跳转
                                    this.props.closePop()
                                    this.props.history.push('./bugAboutMe')
                                    setTimeout(() => {
                                        Store.dispatch(showBugNum(item.id))
                                    }, 500);
                                } else {
                                    this.props.closePopAndOpenModal(item)
                                }
                                HttpApi.obs({ sql: `update bugs set isread = 1 where id = ${item.id}` })
                            }}>详情</a>]}
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