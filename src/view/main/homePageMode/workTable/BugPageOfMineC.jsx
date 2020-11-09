import React, { useEffect } from 'react'
export default props => {
    useEffect(() => {
        console.log('2')
        return () => { console.log('卸载222') }
    }, [])
    return <div>BugPageOfMineC</div>
}