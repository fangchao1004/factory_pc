import React, { useReducer } from 'react'

const initialState = {
    version: 'Beta 0.5',
    unreadBugCount: 0,
    unreadWarnCount: 0,
    aboutMeBugCount: 0,
    aboutMeTaskCount: 0,
    runBugCount: 0,
    heightLightBugId: 0,
}
function reducer(state, action) {
    switch (action.type) {
        case 'unreadBugCount': return { ...state, unreadBugCount: action.data }
        case 'unreadWarnCount': return { ...state, unreadWarnCount: action.data }
        case 'aboutMeBugCount': return { ...state, aboutMeBugCount: action.data }
        case 'aboutMeTaskCount': return { ...state, aboutMeTaskCount: action.data }
        case 'runBugCount': return { ...state, runBugCount: action.data }
        case 'heightLightBugId': return { ...state, heightLightBugId: action.data }
        default: return state
    }
}

export const AppDataContext = React.createContext(null)

export default function AppRedux({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    return <AppDataContext.Provider value={{ appState: state, appDispatch: dispatch }}>{children}</AppDataContext.Provider>
}