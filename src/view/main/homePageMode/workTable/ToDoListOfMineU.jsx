import React, { useEffect, useCallback } from 'react'
export default props => {

    const getBugsListAboutMe = useCallback(async () => {

    }, [])
    useEffect(() => {
        getBugsListAboutMe()
        console.log('1')
        return () => { console.log('卸载111') }
    }, [getBugsListAboutMe])
    return <div>BugPageOfMineU</div>
}