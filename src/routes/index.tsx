import {createFileRoute} from '@tanstack/react-router'
// import {useState} from "react";
// import {getGithubAccessToken, loginToGithub} from "@/utils/github/login.ts";

export const Route = createFileRoute('/')({
    component: App,
})

function App() {
    // const accessToken, setAccessToken] = useState<string>()
    return (
        <div className="App">
            <h1>Hello. kjær? ddddd</h1>
            {/*<button onClick={()=>{*/}
            {/*    loginToGithub().then(async ()=>{*/}
            {/*        var fetchedAccesstoken = await getGithubAccessToken();*/}
            {/*        if(fetchedAccesstoken){*/}
            {/*            setAccessToken(fetchedAccesstoken)*/}
            {/*        }*/}
            {/*    })*/}
            {/*}}>Login to github</button>*/}

            {/*{!accessToken && <div>Missing accesstoken</div>}*/}
            {/*{accessToken && <div>Accesstoken: {accessToken}</div>}*/}
        </div>
    )
}
