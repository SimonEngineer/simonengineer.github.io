import {createFileRoute} from '@tanstack/react-router'
import MDEditor from "@uiw/react-md-editor";
import '../../styles/markdown.css'
import { useState} from "react";
import readMe from '../../../README.md?raw';
export const Route = createFileRoute('/about/edit')({
    component: RouteComponent,
})

function RouteComponent() {
    const [value, setValue] = useState(readMe ?? "");
    return<div  style={{height:'100vh', overflow:"hidden"}}>

    <div className="editor-container" style={{height: '100%'}}>
        <MDEditor
            value={value}
            onChange={(val) => setValue(val ?? "")}
            preview={"live"}
            height="100%"
        />

    </div>
    </div>

}
