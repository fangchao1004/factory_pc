import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DatePicker, Checkbox, Select } from 'antd'
import moment from 'moment'
import 'antd/dist/antd.css'
import { getPinYin } from './Tool'
const testuri = 'http://60.174.196.158:12345/'
export function RenderEngine({ isAgent, jsonlist, userList, currentUser, currentStatus, currentPageIndex, scaleNum = 1, bgscaleNum = 1, callbackValue }) {
  const pagediv = useRef(null)
  const [list, setList] = useState(jsonlist)
  const changeComponetsValue = useCallback(
    (index, value) => {
      let copylist = JSON.parse(JSON.stringify(list))
      copylist.pages[currentPageIndex].components[index].attribute.value = value
      // console.log('最新表单json数据:', copylist)
      setList(copylist)
      if (callbackValue) callbackValue(copylist)
    },
    [list, currentPageIndex, callbackValue]
  )
  const componentsRender = useCallback(
    (item, index) => {
      if (!item) {
        return null
      }
      switch (item.type) {
        case 'input':
          return (
            <input
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              onChange={e => {
                changeComponetsValue(index, e.target.value)
              }}
            />
          )
        case 'textarea':
          return (
            <textarea
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              onChange={e => {
                changeComponetsValue(index, e.target.value)
              }}
            />
          )
        case 'daterange':
        case 'daterange1':
          return (
            <DatePicker.RangePicker
              placeholder=''
              size='small'
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              format='YYYY年MM月DD日 HH时mm分'
              showTime={{ format: 'HH时mm分' }}
              value={
                item.attribute.value.length > 1
                  ? [moment(item.attribute.value[0]), moment(item.attribute.value[1])]
                  : null
              }
              onChange={(_, dateString) => {
                changeComponetsValue(index, changeMomentFormat(dateString))
              }}
            />
          )
        case 'datepicker':
        case 'datepicker1':
          return (
            <DatePicker
              placeholder=''
              size='small'
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              format='YYYY年MM月DD日 HH时mm分'
              showTime={{ format: 'HH时mm分' }}
              value={item.attribute.value ? moment(item.attribute.value) : null}
              onChange={(_, dateString) => {
                changeComponetsValue(index, changeMomentFormat(dateString))
              }}
            />
          )
        case 'checkbox':
          return (
            <Checkbox
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              checked={item.attribute.value ? true : false}
              onChange={e => {
                changeComponetsValue(index, e.target.checked)
              }}
            />
          )
        case 'checkboxgroup':
          return (
            <Checkbox.Group
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              onChange={checkedValues => {
                changeComponetsValue(index, checkedValues)
              }}
            />
          )
        case 'select':
          return (
            <Select
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              size='small'
              allowClear={true}
              placeholder=''
              showSearch
              optionFilterProp='children'
              onChange={value => {
                changeComponetsValue(index, value)
              }}
              filterOption={(input, option) => {
                if (option.props.short_lab) {
                  let res = option.props.short_lab.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  return res
                } else {
                  return false
                }
              }}
            >
              {userList.map((item, index) => {
                return (
                  <Select.Option key={index} value={item.id} short_lab={getPinYin(item.name)[0] || ''}>
                    {item.name}
                  </Select.Option>
                )
              })}
            </Select>
          )
        default:
          return null
      }
    },
    [changeComponetsValue, userList]
  )
  const init = useCallback(() => {
    setList(jsonlist)
  }, [jsonlist])
  useEffect(() => {
    init()
  }, [init])
  return (
    <div
      id='renderEngine'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 10,
        overflow: 'auto',
        height: 1208,
        width: 860,
        // backgroundColor:'blue'
      }}>
      <div
        ref={pagediv}
        style={{
          height: 1188 * bgscaleNum,
          width: 840 * bgscaleNum,
          position: 'relative',
          transform: `scale(${scaleNum})` ///整体缩放比例
        }}>
        <img
          draggable="false"
          src={list.pages ? testuri + list.pages[currentPageIndex].background : ''}
          style={{
            height: 1188 * bgscaleNum,
            width: 840 * bgscaleNum,
          }}
          alt=''
        />
        {list.pages
          ? list.pages[currentPageIndex].components.map((item, index) => {
            // console.log("isAgent:", isAgent);
            let disabled = checkCellDisable(item.attribute.able_list, currentStatus, currentUser.permission, isAgent)
            item.attribute.disabled = disabled
            // let isempty = checkCellIsEmpty(item.attribute, currentStatus)
            // item.attribute.isempty = isempty
            return componentsRender(item, index)
          })
          : null}
      </div>
    </div>
  )
}

/**
 * '2020年10年10日 10时10分' => '2020-10-10 10:10'
 * @param {*} timelistOrStr  '2020年10年10日 10时10分' or ['2020年10年10日 10时10分','2020年10年10日 10时10分']
 */
function changeMomentFormat(timelistOrStr) {
  if (typeof timelistOrStr == 'string') {
    return timelistOrStr
      .replace(/年/g, '-')
      .replace(/月/g, '-')
      .replace(/日/g, '')
      .replace(/时/g, ':')
      .replace(/分/g, '')
  }
  let res = timelistOrStr.map(item => {
    return item.replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '').replace(/时/g, ':').replace(/分/g, '')
  })
  return res
}

/**
 * 判断当前状态下，当前元素组件是否禁用
 * @param {*} able_list  [{ "status": 0, "per": [0,3] }],
 * @param {*} currentStatus 0or1or2or3
 * @param {*} currentUserPermissionList "0,1,3"
 * @param {*} isAgent 0 或 1
 */
function checkCellDisable(able_list, currentStatus, currentUserPermission, isAgent) {
  if (!able_list) { return true }
  if (!currentUserPermission) { return true }
  let currentUserPermissionList = currentUserPermission.split(',')
  let disabled = true;
  able_list.forEach((item) => {
    if (item.status === currentStatus) {
      if (isAgent) {///临时代理的情况下 只需要比对组件是否和当前状态匹配
        disabled = false
      } else {///正常情况下；要再判断权限是否对应
        item.per.forEach((needPer) => {
          if (currentUserPermissionList) {
            currentUserPermissionList.forEach((hasPer) => {
              if (String(needPer) === String(hasPer)) { disabled = false }
            })
          }
        })
      }
    }
  })
  return disabled
}