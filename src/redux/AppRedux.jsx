import React, { useReducer } from 'react'

const initialState = {
    version: 'v1.5.7.2-HF',
    unreadBugCount: 0,
    unreadWarnCount: 0,
    aboutMeBugCount: 0,
    runBugCount: 0,
    heightLightBugId: 0,
    aboutMeTaskList: [],
    allAboutMeBugList: [],///所有与我相关的缺陷【专业相关+运行处理(如果有运行权限的话)去重复】
    currentJBTCount: 0,
}
function reducer(state, action) {
    switch (action.type) {
        case 'unreadBugCount': return { ...state, unreadBugCount: action.data }
        case 'unreadWarnCount': return { ...state, unreadWarnCount: action.data }
        case 'aboutMeBugCount': return { ...state, aboutMeBugCount: action.data }
        case 'aboutMeTaskList': return { ...state, aboutMeTaskList: action.data }
        case 'runBugCount': return { ...state, runBugCount: action.data }
        case 'heightLightBugId': return { ...state, heightLightBugId: action.data }
        case 'allAboutMeBugList': return { ...state, allAboutMeBugList: action.data }
        case 'currentJBTCount': return { ...state, currentJBTCount: action.data }
        default: return state
    }
}

export const AppDataContext = React.createContext(null)

export default function AppRedux({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    return <AppDataContext.Provider value={{ appState: state, appDispatch: dispatch }}>{children}</AppDataContext.Provider>
}