import { Alert, Drawer, Spin } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import HttpApi from '../../util/HttpApi'
import { RenderEngine } from '../../util/RenderEngine'
const storage = window.localStorage;

export default function JobTicketDrawerForShowEdit({ visible, onClose, record, resetData }) {
    // console.log('record:', record);
    const [currentJobTicketValue, setCurrentJobTicketValue] = useState({})///填写改动后的数值- 提交时使用
    const [currentUser] = useState(JSON.parse(storage.getItem('userinfo')))
    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(true)

    const runUserlist = useCallback(async (user_list, role_id) => {
        let res = await HttpApi.getRunnerIdList({ role_id })
        if (res.data.code === 0) {
            let runner_list1 = res.data.data;
            // console.log('res:', res.data.data);
            // console.log('user_list:', user_list);
            let copy_user_list = JSON.parse(JSON.stringify(user_list))
            copy_user_list.forEach((user) => {
                user.is_runner = false
                runner_list1.forEach((runner) => {
                    if (user.id === runner.user_id) { user.is_runner = true }
                })
            })
            let runner_list = [];
            let other_list = [];
            copy_user_list.forEach((item) => {
                const { id, name } = item
                if (item.is_runner) {
                    runner_list.push({ id, name })
                } else { other_list.push({ id, name }) }
            })
            // console.log('runner_list:', runner_list);
            // console.log('other_list:', other_list);
        }
    }, [])

    const init = useCallback(async () => {
        // console.log('init');
        if (record && record.job_t_r_id) {
            let res = await HttpApi.getJTRecords({ id: record.job_t_r_id })
            if (res.data.code === 0) {
                let tempObj = JSON.parse(JSON.stringify(res.data.data[0]))
                tempObj.pages = JSON.parse(tempObj.pages)
                // tempObj.pages = testData
                // console.log('testData:', testData);
                setCurrentJobTicketValue(tempObj)///票数据初始化
            }
            let res_user = await HttpApi.getUserInfo({ effective: 1 })
            if (res_user.data.code === 0) {
                var user_list = res_user.data.data.map((item) => { return { id: item.id, name: item.name } })
                setUserList(user_list)
            }
            if (record.is_sub === 1) {
                // console.log('措施票');
                // console.log('record:', record);
                if (record.status === 1 && currentUser.permission && currentUser.permission.split(',').indexOf("1") !== -1) {
                    ///措施票 状态1 待安措时 运行可以操作
                    runUserlist(user_list, 8)///初审人名单
                } else if (record.status === 2 && currentUser.permission && currentUser.permission.split(',').indexOf("7") !== -1) {
                    runUserlist(user_list, 9)///复审人名单
                } else if (record.status === 3 && currentUser.permission && currentUser.permission.split(',').indexOf("8") !== -1) {
                    runUserlist(user_list, 10)///批准人名单
                } else if (record.status === 4 && currentUser.permission && currentUser.permission.split(',').indexOf("9") !== -1) {
                    runUserlist(user_list, 2)///运行人名单
                }
                else if (record.status === 6) {

                }
            } else {
                console.log('主票');
                if (record.status === 1 && currentUser.id === record.user_id) {
                    ///1待签发  状态时，申请人可以操作
                    if (record.status === 1) {
                        if (currentUser.permission.split(',').indexOf("0") === -1) {
                        }
                    } else {
                    }
                }
                // console.log('currentUser:', currentUser);
                // console.log('专工权限:', currentUser.permission.split(',').indexOf("0") !== -1);
                // console.log('运行权限:', currentUser.permission.split(',').indexOf("1") !== -1);
                if (record.status === 1 && currentUser.major_id_all && currentUser.major_id_all.split(',').indexOf(String(record.major_id)) !== -1 && currentUser.permission && currentUser.permission.split(',').indexOf("0") !== -1) {
                    ///1待审核 状态时，对应专业的专工可以操作
                    ///1待审核 状态时 专工要有运行人员名单
                    // console.log('1待审核 状态时 专工要有运行人员名单');
                    // runUserlist(user_list)
                }
                if ((record.status === 2 || record.status === 3) && currentUser.major_id_all && currentUser.permission && currentUser.permission.split(',').indexOf("1") !== -1) {
                    ///2待接票 3待完结 状态时，运行可以操作
                    ///2待接票 状态时 运行要有运行人员名单
                    // if (record.status === 2) {
                    //     // console.log('2待接票 状态时 运行要有运行人员名单');
                    //     runUserlist(user_list)
                    // }
                }
                if (record.status === 4) {
                } else if (record.status === 1 || record.status === 2) {
                    runUserlist(user_list, 2)
                }
            }
        }
        setLoading(false)
    }, [record, currentUser, runUserlist])

    const renderAllPage = useCallback(() => {
        if (record && currentJobTicketValue && currentJobTicketValue.pages) {
            // console.log('aaaa:', currentJobTicketValue);
            let scalObj = {}
            if (currentJobTicketValue.scal) {
                scalObj = JSON.parse(currentJobTicketValue.scal)
            }
            return currentJobTicketValue.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={currentJobTicketValue}
                    currentStatus={record ? record.status : 1}
                    userList={userList}
                    currentUser={currentUser}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscalNum || 1}
                    callbackValue={v => {
                        setCurrentJobTicketValue(v)
                    }}
                />
            })
        }
    }, [record, currentJobTicketValue, currentUser, userList])
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            init();
        }, 500);
    }, [init])

    return (
        <Drawer
            destroyOnClose={true}
            width={920}
            title="工作票查看"
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            {loading ?
                <Spin tip="加载数据中...">
                    <Alert
                        message="正在打开【工作票查看】页面"
                        description="在此页面查看工作票，或进行数据修改"
                        type="info"
                    />
                </Spin> :
                <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#F1F2F5', padding: '10px 10px 0px 10px', }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {renderAllPage()}
                    </div>
                </div>
            }
        </Drawer >
    )
}
