import {createFileRoute} from '@tanstack/react-router'
import readMe from '../../README.md?raw';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import '../styles/markdown.css'
import { useState} from "react";
import MDEditor from '@uiw/react-md-editor';



export const Route = createFileRoute('/about')({
    component: RouteComponent,
})

function RouteComponent() {

    const [value, setValue] = useState(readMe);
    return (
        <div className="markdown-container" style={{height:'90vh'}}>
            <div className="editor-container" style={{height: '100%'}}>
                <MDEditor
                    value={value}
                    onChange={(val)=>setValue(val ?? "")}
                    preview={"live"}
                    height="100%"
                />

            </div>

            <div className="preview-container">
                {/*<MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />*/}
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{value}</ReactMarkdown>
            </div>
        </div>
    )
}
