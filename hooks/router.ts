import { useRouter } from "next/router";

export function useSiteRouter() {
    const router = useRouter();

    return {
        ...router,
        login() {
            return router.push(`/login/?returnUrl=${encodeURIComponent(router.asPath)}`);
        }
    }
}