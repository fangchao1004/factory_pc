import { Drawer } from 'antd'
import React, { useCallback } from 'react'
import { RenderEngine } from '../../util/RenderEngine';

export default function SubJobTicketOfCreateDrawer({ visible, onClose, currentSubJBT, userList, currentUser, sbjtvalueChangeCallback }) {
    const renderAllPage = useCallback(() => {
        // console.log('currentSubJBT:', currentSubJBT);
        if (!currentSubJBT.pages) { return null }
        let scalObj = {}
        if (currentSubJBT.scal) {
            scalObj = JSON.parse(currentSubJBT.scal)
        }
        let copy_currentSubJBT = JSON.parse(JSON.stringify(currentSubJBT))
        // console.log('copy_currentSubJBT:', copy_currentSubJBT);
        try {
            return copy_currentSubJBT.pages.map((_, index) => {
                return <RenderEngine
                    key={index}
                    jsonlist={copy_currentSubJBT}
                    userList={userList}
                    currentUser={currentUser}
                    currentStatus={0}
                    currentPageIndex={index}
                    scaleNum={scalObj.scaleNum || 1}
                    bgscaleNum={scalObj.bgscalNum || 1}
                    callbackValue={v => {
                        sbjtvalueChangeCallback(v)
                    }}
                />
            })
        } catch (error) {
            return null
        }
    }, [currentSubJBT, currentUser, userList, sbjtvalueChangeCallback])
    return (
        <Drawer
            destroyOnClose={true}
            width={910}
            title="副票编辑"
            placement='left'
            onClose={onClose}
            visible={visible}
        >
            <div style={{ backgroundColor: '#F1F2F5' }}>
                {renderAllPage()}
            </div>
        </Drawer>
    )
}
