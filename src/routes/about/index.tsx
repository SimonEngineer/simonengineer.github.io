import {createFileRoute} from '@tanstack/react-router'
import readMe from '../../../README.md?raw';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import '../../styles/markdown.css'


export const Route = createFileRoute('/about/')({
    component: RouteComponent,
})

function RouteComponent() {


    return (
        <div className="markdown-container">
            <div className="markdown-body markdown ">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{readMe}</ReactMarkdown>
            </div>
        </div>
    )
}
