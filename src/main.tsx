import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import {Octokit} from "@octokit/rest";
import {GetStoredPat, GitHubRepo} from "@/utils/github/githubHandler.ts";

export interface RouterContext {
  octokit: Octokit,
  someData?:string,
  githubRepo: GitHubRepo,
}

const octokit = new Octokit({auth:GetStoredPat()})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    octokit: octokit,
    someData: "initialData",
    githubRepo: new GitHubRepo(octokit),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
