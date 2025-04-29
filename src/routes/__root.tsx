import {Outlet, redirect, createRootRouteWithContext} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {unknown} from "zod";
import type {RouterContext} from "@/main.tsx";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
    validateSearch:(search: Record<string, unknown>):Record<string, unknown> => search,
    loaderDeps:({search}:{search:Record<string, unknown>})=>({search}),
    loader: ({ deps:{search}}) => {
        const {githubPagesRedirectPath,...rest} = search
        const redirectPath = githubPagesRedirectPath == unknown ? null : githubPagesRedirectPath as string
        if (redirectPath) {
            const normalized = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`
            throw redirect({ to: normalized,search:rest })
        }

    }
})
