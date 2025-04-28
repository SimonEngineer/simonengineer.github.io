import {Outlet, createRootRoute, redirect} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
    loader: ({ location}) => {
        const url = new URL(location.href)
        const redirectPath = url.searchParams.get('githubPagesRedirectPath')
        if (redirectPath) {
            const continuedSearchParams = new URLSearchParams(location.href)
            continuedSearchParams.delete('githubPagesRedirectPath')
            // Normalize the path if needed
            const normalized = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`
            const searchString = continuedSearchParams.toString()
            const finalUrl = searchString
                ? `${normalized}?${searchString}`
                : normalized

            throw redirect({ to: finalUrl })
        }
        return null
    }
})
