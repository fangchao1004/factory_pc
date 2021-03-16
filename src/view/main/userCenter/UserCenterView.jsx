import React, { useContext, useState } from 'react';
import { Button, Descriptions, Icon, Tag } from 'antd';
import { AppDataContext } from '../../../redux/AppRedux';
import { adminPermission, permisstionWithDes } from '../../util/AppData';
import { environmentIsTest } from '../../util/HttpApi';
import UpdatePasswordView from './UpdatePasswordView'
const storage = window.localStorage;
var localUserInfo = JSON.parse(storage.getItem('userinfo'));
export default props => {
    localUserInfo = JSON.parse(storage.getItem('userinfo'));
    const { appState } = useContext(AppDataContext)
    const [passwordVIsible, setPasswordVIsible] = useState(false)
    return <div style={styles.root}>
        <div style={styles.body}>
            <Descriptions title="个人信息" bordered size='small' column={2}>
                <Descriptions.Item label="姓名">{localUserInfo.name}</Descriptions.Item>
                <Descriptions.Item label="账号">{<div style={styles.account}>
                    {localUserInfo.username}
                    <Button size="small" type='link' icon='edit' style={{ padding: 0 }} onClick={() => { setPasswordVIsible(true) }}>密码修改</Button>
                </div>}</Descriptions.Item>
                <Descriptions.Item label="专业">{localUserInfo.major_name_all || '-'}</Descriptions.Item>
                <Descriptions.Item label="部门">{localUserInfo.level_name || '-'}</Descriptions.Item>
                <Descriptions.Item label="角色">{localUserInfo.role_id_all && localUserInfo.role_id_all.length > 0 ? localUserInfo.role_name_all.split(',').map((item, index) => <Tag key={index} color='blue'>{item}</Tag>) : '-'}</Descriptions.Item>
                <Descriptions.Item label="管理">{localUserInfo.isadmin ? <Icon type="check-circle" theme="twoTone" /> : '-'}</Descriptions.Item>
                <Descriptions.Item label="备注">{localUserInfo.remark || '-'}</Descriptions.Item>
                <Descriptions.Item label="版本">{
                    <div style={styles.account}>
                        <Tag color='blue'>{appState.version}</Tag>
                        {/* <div style={{ cursor: 'pointer' }}>
                            <Icon type="profile" theme="twoTone" />
                            <a style={{ color: "#47A2FF", marginLeft: 10 }} rel="noopener noreferrer" href={`http://60.174.196.158:12345/update_log/update${environmentIsTest ? '_test' : ''}.html`} title="更新日志" target="_blank">更新日志</a>
                        </div> */}
                    </div>}</Descriptions.Item>
            </Descriptions>
        </div>
        <div style={styles.body}>
            <Descriptions title="角色说明" bordered size='small' column={2}>
                <Descriptions.Item label="管理">{adminPermission.des}</Descriptions.Item>
                <Descriptions.Item label="维修">{permisstionWithDes[0].des}</Descriptions.Item>
                <Descriptions.Item label="专工">{permisstionWithDes[1].des}</Descriptions.Item>
                <Descriptions.Item label="运行">{permisstionWithDes[2].des}</Descriptions.Item>
                <Descriptions.Item label="财务">{permisstionWithDes[3].des}</Descriptions.Item>
            </Descriptions>
        </div>
        <UpdatePasswordView visible={passwordVIsible} onCancel={() => { setPasswordVIsible(false) }} />
    </div>
}

const styles = {
    account: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    root: {
        backgroundColor: '#F1F2F5',
        width: '100%',
        height: '100vh',
        padding: 10,
    },
    body: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        marginBottom: 10,
    },
    button: {
        marginLeft: 10
    },
}