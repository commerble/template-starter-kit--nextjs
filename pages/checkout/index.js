
import Link from 'next/link'
import { startCheckout } from '../../libs/cbpaas';
import { ERR_UNAUTHORIZED } from '../../libs/constant';

export default function CheckoutStartPage({data}) {
    return <main>
        <h1>Redirecting...</h1>
        <Link href='/cart'>Back to Cart</Link>
        <pre>{JSON.stringify(data, null, '\t')}</pre>
    </main>
}

export async function getServerSideProps(context) {
    const result = await startCheckout(context, 1);

    if (result.errors.some(err => err.type === ERR_UNAUTHORIZED)) {
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
            props:{},
        }
    }

    if (result.next === 'shipping') {
        return {
            redirect: {
                permanent: false,
                destination: "/checkout/step1",
            },
            props:{},
        }
    }
    
    if (result.next === 'confirm') {
        return {
            redirect: {
                permanent: false,
                destination: "/checkout/confirm",
            },
            props:{},
        }
    }

    return { props: { data: result } }
  }