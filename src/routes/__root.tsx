import {Outlet, createRootRoute, redirect} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {unknown} from "zod";

export const Route = createRootRoute({
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
