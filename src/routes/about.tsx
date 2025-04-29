import {createFileRoute} from '@tanstack/react-router'
import readMe from '../../README.md?raw';

// import MarkdownIt from 'markdown-it';
// import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // or your theme

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import '../styles/markdown.css'

// async function GetTestAsyncData(): Promise<{ name:string }> {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve({name: 'test'});
//         }, 3000);
//     });
// }

export const Route = createFileRoute('/about')({
    component: RouteComponent,
    // loader: () =>  GetTestAsyncData(),
    // pendingComponent: PendingComponent,

})
//
// const md = new MarkdownIt({
//     html: true,
//     linkify: true,
//     highlight: function (str:string, lang:string):string {
//         if (lang && hljs.getLanguage(lang)) {
//             try {
//                 return '<pre class="hljs"><code>' +
//                     hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
//                     '</code></pre>';
//             } catch (_) {}
//         }
//         return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
//     }
// });

function RouteComponent() {
    // const html = marked.parse(readMe) as string
    // const html = md.render(readMe)
    return (
        <div className="markdown-container">
            <div className="markdown-body">
                {/*<Markdown remarkPlugins={[remarkGfm]}>{readMe}</Markdown>*/}
                {/*<div id="readme"  dangerouslySetInnerHTML={{__html:html} }></div>*/}
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{readMe}</ReactMarkdown>
            </div>
        </div>
    )
}

//
// function PendingComponent() {
//
//     return (
//         <div className="App">
//             <h1>Pending</h1>
//
//         </div>
//     )
// }
