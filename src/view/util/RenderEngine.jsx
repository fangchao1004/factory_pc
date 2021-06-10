import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DatePicker, Checkbox, Select, message, Radio } from 'antd'
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
          let maxLengthStr = '10'
          try {
            maxLengthStr = String(parseInt(item.attribute.style.width / item.attribute.style.fontSize) - 1)
            // console.log('字符maxLength:', item.attribute.name, ':', maxLengthStr)
          } catch (error) {
            console.log('input error:', item.attribute.name, error)
          }
          return (
            <input
              key={index}
              {...item.attribute}
              maxLength={maxLengthStr}
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
              allowClear={false}
              disabledDate={disabledDate}
              disabledTime={disabledRangeTime}
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
                if (dateString.length > 1) {
                  if (item.attribute.max_hour) {
                    let start_time = moment(changeMomentFormat(dateString[0]))
                    let end_time = moment(changeMomentFormat(dateString[1]))
                    if (end_time - start_time > (item.attribute.max_hour) * 3600000) {
                      message.error(`工作票有效期为${item.attribute.max_hour}小时，请在规定时间内完成`)
                      changeComponetsValue(index, '')
                      return
                    }
                  }
                }
                changeComponetsValue(index, changeMomentFormat(dateString))
              }}
            />
          )
        case 'datepicker':
        case 'datepicker1':
          return (
            <DatePicker
              allowClear={false}
              disabledDate={disabledDate}
              disabledTime={disabledDateTime}
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
        case 'checkboxgroup1':
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
        case 'radio':
          return (
            <Radio
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              checked={item.attribute.value ? true : false}
              onChange={e => {
                changeComponetsValue(index, e.target.checked)
              }}
            />
          )
        case 'radiogroup':
          return (
            <Radio.Group
              key={index}
              {...item.attribute}
              style={{ ...item.attribute.style, borderStyle: item.attribute.isempty ? 'solid' : 'none', borderWidth: 1, borderColor: 'red' }}
              onChange={e => {
                changeComponetsValue(index, e.target.value)
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
                  if (!res) {
                    let res2 = option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    return res2
                  }
                  return res
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
  // let currentUserPermissionList = currentUserPermission.split(',')
  let disabled = true;
  able_list.forEach((item) => {
    if (item.status === currentStatus) {
      disabled = false
      // if (isAgent) {///临时代理的情况下 只需要比对组件是否和当前状态匹配
      //   disabled = false
      // } 
      // else {///正常情况下；要再判断权限是否对应
      //   item.per.forEach((needPer) => {
      //     if (currentUserPermissionList) {
      //       currentUserPermissionList.forEach((hasPer) => {
      //         if (String(needPer) === String(hasPer)) { disabled = false }
      //       })
      //     }
      //   })
      // }
    }
  })
  return disabled
}

function disabledDate(current) {
  return current < moment().startOf('day')
}

function disabledDateTime(date) {
  let current = moment()
  let hour = current.hour()///当前小时
  let minute = current.minute()///当前分钟
  let than_one_hour = date - current >= 1800000 ///大于30分钟
  return {
    disabledHours: () => range(0, 24).splice(0, hour),
    disabledMinutes: () => range(0, than_one_hour ? 0 : minute)
  };
}

function disabledRangeTime(_, type) {
  let current = moment()
  let hour = current.hour()///当前小时
  if (type === 'start') {
    return {
      disabledHours: () => range(0, 24).splice(0, hour),
    };
  }
}

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}